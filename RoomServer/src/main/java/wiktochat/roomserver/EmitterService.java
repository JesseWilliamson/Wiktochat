package wiktochat.roomserver;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class EmitterService {
    private final Map<String, Map<String, SseEmitter>> roomEmitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(String roomId, String sessionId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        emitter.onCompletion(() -> removeEmitter(roomId, sessionId));
        emitter.onTimeout(() -> {
            removeEmitter(roomId, sessionId);
            emitter.complete();
        });
        
        roomEmitters.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                    .put(sessionId, emitter);
        return emitter;
    }

    public void removeEmitter(String roomId, String sessionId) {
        Map<String, SseEmitter> emitters = roomEmitters.get(roomId);
        if (emitters != null) {
            emitters.remove(sessionId);
            if (emitters.isEmpty()) {
                roomEmitters.remove(roomId);
            }
        }
    }

    public void sendMessage(String roomId, GridMessage message) {
        Map<String, SseEmitter> emitters = roomEmitters.get(roomId);
        if (emitters != null) {
            emitters.forEach((sessionId, emitter) -> {
                try {
                    emitter.send(SseEmitter.event()
                        .data(message)
                        .build());
                } catch (Exception e) {
                    removeEmitter(roomId, sessionId);
                }
            });
        }
    }
} 
