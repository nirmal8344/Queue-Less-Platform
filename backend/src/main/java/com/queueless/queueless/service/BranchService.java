package com.queueless.queueless.service;

import com.queueless.queueless.exception.ResourceNotFoundException;
import com.queueless.queueless.model.Branch;
import com.queueless.queueless.model.Holiday;
import com.queueless.queueless.model.Organization;
import com.queueless.queueless.repository.BranchRepository;
import com.queueless.queueless.repository.HolidayRepository;
import com.queueless.queueless.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
public class BranchService {

    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final HolidayRepository holidayRepository;

    public BranchService(OrganizationRepository organizationRepository,
                         BranchRepository branchRepository,
                         HolidayRepository holidayRepository) {
        this.organizationRepository = organizationRepository;
        this.branchRepository = branchRepository;
        this.holidayRepository = holidayRepository;
    }

    public Organization getOrganization() {
        return organizationRepository.findAll().stream().findFirst().orElse(null);
    }

    @Transactional
    public Organization updateOrganization(Organization org) {
        Organization existing = getOrganization();
        if (existing == null) {
            return organizationRepository.save(org);
        }
        existing.setName(org.getName());
        existing.setDescription(org.getDescription());
        existing.setContactEmail(org.getContactEmail());
        existing.setContactPhone(org.getContactPhone());
        existing.setLogoUrl(org.getLogoUrl());
        return organizationRepository.save(existing);
    }

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    public List<Branch> getActiveBranches() {
        return branchRepository.findByActiveTrue();
    }

    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + id));
    }

    @Transactional
    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    @Transactional
    public Branch updateBranch(Long id, Branch updated) {
        Branch branch = getBranchById(id);
        branch.setName(updated.getName());
        branch.setCode(updated.getCode());
        branch.setAddress(updated.getAddress());
        branch.setCity(updated.getCity());
        branch.setPhone(updated.getPhone());
        branch.setEmail(updated.getEmail());
        branch.setOpeningTime(updated.getOpeningTime());
        branch.setClosingTime(updated.getClosingTime());
        branch.setWorkingDays(updated.getWorkingDays());
        branch.setActive(updated.isActive());
        return branchRepository.save(branch);
    }

    @Transactional
    public void deleteBranch(Long id) {
        Branch branch = getBranchById(id);
        branch.setActive(false);
        branchRepository.save(branch);
    }

    // Holiday Management
    public List<Holiday> getHolidaysForBranch(Long branchId) {
        return holidayRepository.findByBranchIdOrBranchIdIsNull(branchId);
    }

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    @Transactional
    public Holiday addHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    @Transactional
    public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }

    public boolean isBranchOpenOn(Long branchId, LocalDate date, LocalTime time) {
        Branch branch = getBranchById(branchId);
        if (!branch.isActive()) return false;

        // Check if day is holiday
        boolean isHoliday = holidayRepository.existsByBranchIdAndHolidayDate(branchId, date) ||
                holidayRepository.existsByBranchIdIsNullAndHolidayDate(date);
        if (isHoliday) return false;

        // Check working days
        DayOfWeek dow = date.getDayOfWeek();
        if (branch.getWorkingDays() != null) {
            List<String> days = Arrays.asList(branch.getWorkingDays().toUpperCase().split(","));
            if (!days.contains(dow.name())) {
                return false;
            }
        }

        // Check operating hours
        if (time != null) {
            if (time.isBefore(branch.getOpeningTime()) || time.isAfter(branch.getClosingTime())) {
                return false;
            }
        }

        return true;
    }
}
