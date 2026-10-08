package com.queueless.queueless.service;

import com.queueless.queueless.config.JwtTokenProvider;
import com.queueless.queueless.dto.AuthRequest;
import com.queueless.queueless.dto.AuthResponse;
import com.queueless.queueless.dto.RegisterRequest;
import com.queueless.queueless.dto.UserDTO;
import com.queueless.queueless.exception.BadRequestException;
import com.queueless.queueless.exception.ResourceNotFoundException;
import com.queueless.queueless.model.Role;
import com.queueless.queueless.model.User;
import com.queueless.queueless.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        // Public registration always creates CUSTOMER accounts — role is never accepted from the request
        user.setRole(Role.CUSTOMER);

        User saved = userRepository.save(user);

        String token = tokenProvider.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getAssignedBranchId(), saved.getAssignedCounterId());
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Enforce role-based login: if expectedRole is specified, the user's role must match
        if (request.getExpectedRole() != null && user.getRole() != request.getExpectedRole()) {
            throw new BadCredentialsException("Access denied. This login portal is for " + request.getExpectedRole() + " accounts only.");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAssignedBranchId(), user.getAssignedCounterId());
    }

    public UserDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public UserDTO updateProfile(Long userId, String name, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (name != null && !name.isBlank()) user.setName(name);
        if (phone != null) user.setPhone(phone);
        return UserDTO.fromEntity(userRepository.save(user));
    }

    public List<UserDTO> getAllStaff() {
        return userRepository.findByRole(Role.STAFF)
                .stream().map(UserDTO::fromEntity).collect(Collectors.toList());
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream().map(UserDTO::fromEntity).collect(Collectors.toList());
    }
}
