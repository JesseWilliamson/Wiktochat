package wiktochat.roomserver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmitterService {
  private static final Logger logger = LoggerFactory.getLogger(EmitterService.class);
  private final Map<String, Map<String, SseEmitter>> roomEmitters = new ConcurrentHashMap<>();

  public SseEmitter createEmitter(String roomId, String sessionId) {
    SseEmitter emitter = new SseEmitter(360000L); // 6 minutes timeout

    emitter.onCompletion(() -> {
      logger.info("SSE completed for session: {} in room: {}", sessionId, roomId);
      removeEmitterFromRoom(roomId, sessionId);
    });

    emitter.onTimeout(() -> {
      logger.info("SSE timeout for session: {} in room: {}", sessionId, roomId);
      emitter.complete();
      removeEmitterFromRoom(roomId, sessionId);
    });

    emitter.onError(ex -> {
      logger.error("SSE error for session: {} in room: {}", sessionId, roomId, ex);
      emitter.complete();
      removeEmitterFromRoom(roomId, sessionId);
    });

    // Send initial keep-alive event
    try {
      emitter.send(SseEmitter.event()
        .name("keep-alive")
        .data("connected"));
    } catch (IOException e) {
      logger.error("Error sending initial event", e);
      emitter.complete();
      return emitter;
    }

    roomEmitters.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
      .put(sessionId, emitter);
    return emitter;
  }

  public void sendMessage(String roomId, Object message) {
    Map<String, SseEmitter> emitters = roomEmitters.get(roomId);
    if (emitters == null) {
      return;
    }

    List<String> deadEmitters = new ArrayList<>();

    emitters.forEach((sessionId, emitter) -> {
      try {
        emitter.send(SseEmitter.event()
          .name("message")
          .data(message));
      } catch (Exception e) {
        logger.error("Error sending message to {} in room {}", sessionId, roomId, e);
        deadEmitters.add(sessionId);
      }
    });

    // Clean up dead emitters
    deadEmitters.forEach(sessionId -> removeEmitterFromRoom(roomId, sessionId));
  }

  private void removeEmitterFromRoom(String roomId, String sessionId) {
    Map<String, SseEmitter> emitters = roomEmitters.get(roomId);
    if (emitters != null) {
      emitters.remove(sessionId);
      if (emitters.isEmpty()) {
        roomEmitters.remove(roomId);
      }
    }
  }
}
