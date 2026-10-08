package com.queueless.queueless.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${cors.allowed-origins:}")
    private String corsAllowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins;
        if (corsAllowedOrigins != null && !corsAllowedOrigins.isBlank()) {
            origins = corsAllowedOrigins.split(",");
        } else {
            origins = new String[]{"http://localhost:5173", "http://localhost:3000", "http://localhost:4173"};
        }

        registry.addEndpoint("/ws-queue")
                .setAllowedOrigins(origins)
                .withSockJS();
        registry.addEndpoint("/ws-queue")
                .setAllowedOrigins(origins);
    }
}
