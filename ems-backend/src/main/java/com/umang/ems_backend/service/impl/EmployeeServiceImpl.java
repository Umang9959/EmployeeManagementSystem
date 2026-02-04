package com.umang.ems_backend.service.impl;

import com.umang.ems_backend.dto.EmployeeDto;
import com.umang.ems_backend.entity.Employee;
import com.umang.ems_backend.exception.DuplicateResourceException;
import com.umang.ems_backend.exception.ResourceNotFoundException;
import com.umang.ems_backend.mapper.EmployeeMapper;
import com.umang.ems_backend.repository.EmployeeRepository;
import com.umang.ems_backend.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private EmployeeRepository employeeRepository;
    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        if (employeeDto.getEmail() != null && employeeRepository.findByEmailIgnoreCase(employeeDto.getEmail().trim()).isPresent()) {
            throw new DuplicateResourceException("Email already taken");
        }
        Employee employee = EmployeeMapper.maptoEmployee(employeeDto);
        Employee savedEmployee = employeeRepository.save(employee);
        return EmployeeMapper.maptoEmployeeDto(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeById(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee is not found with the existing ID : " + employeeId));
        return EmployeeMapper.maptoEmployeeDto(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream().map((employee) -> EmployeeMapper.maptoEmployeeDto(employee)).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto updateEmployee(Long employeeId, EmployeeDto updatedEmployee) {

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee is not found with the existing ID : " + employeeId));
        if (updatedEmployee.getEmail() != null) {
            employeeRepository.findByEmailIgnoreCase(updatedEmployee.getEmail().trim())
                    .filter(existing -> !existing.getId().equals(employeeId))
                    .ifPresent(existing -> {
                        throw new DuplicateResourceException("Email already taken");
                    });
        }
        employee.setFirstName(updatedEmployee.getFirstName());
        employee.setLastName(updatedEmployee.getLastName());
        employee.setEmail(updatedEmployee.getEmail());

        Employee updatedEmployeeObj = employeeRepository.save(employee);

        return EmployeeMapper.maptoEmployeeDto(updatedEmployeeObj);

    }

    @Override
    public void deleteEmployee(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee is not found with the existing ID : " + employeeId));

        employeeRepository.deleteById(employeeId);

    }

    @Override
    public List<EmployeeDto> searchEmployees(String query) {
        String searchValue = query == null ? "" : query.trim();
        if (searchValue.isEmpty()) {
            return getAllEmployees();
        }

        List<Employee> employees = employeeRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        searchValue,
                        searchValue,
                        searchValue
                );

        if (searchValue.matches("\\d+")) {
            Long id = Long.parseLong(searchValue);
            Optional<Employee> employeeById = employeeRepository.findById(id);
            if (employeeById.isPresent() && employees.stream().noneMatch(e -> e.getId().equals(id))) {
                employees.add(employeeById.get());
            }
        }

        return employees.stream()
                .map(EmployeeMapper::maptoEmployeeDto)
                .collect(Collectors.toList());
    }
}
