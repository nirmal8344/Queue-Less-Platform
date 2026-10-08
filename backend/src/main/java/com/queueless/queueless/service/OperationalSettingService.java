package com.queueless.queueless.service;

import com.queueless.queueless.model.OperationalSetting;
import com.queueless.queueless.repository.OperationalSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OperationalSettingService {

    private final OperationalSettingRepository repository;

    public OperationalSettingService(OperationalSettingRepository repository) {
        this.repository = repository;
    }

    public List<OperationalSetting> getAllSettings() {
        return repository.findAll();
    }

    public String getSetting(String key, String defaultValue) {
        return repository.findBySettingKey(key)
                .map(OperationalSetting::getSettingValue)
                .orElse(defaultValue);
    }

    public int getSettingInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(getSetting(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @Transactional
    public OperationalSetting saveOrUpdateSetting(String key, String value, String description) {
        OperationalSetting setting = repository.findBySettingKey(key)
                .orElse(new OperationalSetting(key, value, description));
        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }
        return repository.save(setting);
    }
}
