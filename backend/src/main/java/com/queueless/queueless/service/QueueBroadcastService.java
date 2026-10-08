package com.queueless.queueless.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class QueueBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public QueueBroadcastService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastQueueUpdate(Long branchId, Object queueData) {
        try {
            messagingTemplate.convertAndSend("/topic/queue/" + branchId, queueData);
            messagingTemplate.convertAndSend("/topic/queue/all", queueData);
        } catch (Exception e) {
            // Handle offline WS
        }
    }

    public void broadcastDisplayUpdate(Long branchId, Object displayData) {
        try {
            messagingTemplate.convertAndSend("/topic/display/" + branchId, displayData);
        } catch (Exception e) {
            // Handle offline WS
        }
    }
}
