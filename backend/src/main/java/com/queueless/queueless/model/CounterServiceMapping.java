package com.queueless.queueless.model;

import jakarta.persistence.*;

@Entity
@Table(name = "counter_services")
public class CounterServiceMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long counterId;

    @Column(nullable = false)
    private Long serviceId;

    public CounterServiceMapping() {}

    public CounterServiceMapping(Long counterId, Long serviceId) {
        this.counterId = counterId;
        this.serviceId = serviceId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCounterId() { return counterId; }
    public void setCounterId(Long counterId) { this.counterId = counterId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
}
