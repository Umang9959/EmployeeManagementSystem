package com.umang.ems_backend.service;

import com.umang.ems_backend.dto.EmployeeDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto employeeDto);

    EmployeeDto getEmployeeById(Long employeeId);

    List<EmployeeDto> getAllEmployees();

    Page<EmployeeDto> getEmployeesPage(int page, int size);

    EmployeeDto updateEmployee(Long employeeId, EmployeeDto updatedEmployee);

    void deleteEmployee(Long employeeId);

    List<EmployeeDto> searchEmployees(String query);

    Page<EmployeeDto> searchEmployees(String query, int page, int size);

}
