package com.queueless.queueless.service;

import com.queueless.queueless.exception.ResourceNotFoundException;
import com.queueless.queueless.model.ServiceEntity;
import com.queueless.queueless.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceManagementService {

    private final ServiceRepository serviceRepository;

    public ServiceManagementService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    public List<ServiceEntity> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    public List<ServiceEntity> getServicesByBranch(Long branchId) {
        if (branchId == null) {
            return serviceRepository.findByActiveTrue();
        }
        return serviceRepository.findByBranchIdAndActiveTrue(branchId);
    }

    public List<ServiceEntity> getAllServicesByBranch(Long branchId) {
        if (branchId == null) {
            return serviceRepository.findAll();
        }
        return serviceRepository.findByBranchId(branchId);
    }

    public ServiceEntity getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
    }

    @Transactional
    public ServiceEntity createService(ServiceEntity service) {
        return serviceRepository.save(service);
    }

    @Transactional
    public ServiceEntity updateService(Long id, ServiceEntity updated) {
        ServiceEntity service = getServiceById(id);
        service.setName(updated.getName());
        service.setCode(updated.getCode());
        service.setDescription(updated.getDescription());
        service.setEstimatedDurationMinutes(updated.getEstimatedDurationMinutes());
        service.setMaxDailyTokens(updated.getMaxDailyTokens());
        service.setBranchId(updated.getBranchId());
        service.setActive(updated.isActive());
        service.setAllowPriority(updated.isAllowPriority());
        return serviceRepository.save(service);
    }

    @Transactional
    public ServiceEntity toggleServiceStatus(Long id) {
        ServiceEntity service = getServiceById(id);
        service.setActive(!service.isActive());
        return serviceRepository.save(service);
    }

    @Transactional
    public void deleteService(Long id) {
        ServiceEntity service = getServiceById(id);
        service.setActive(false);
        serviceRepository.save(service);
    }
}
