package com.umang.ems_backend.controller;

import com.umang.ems_backend.dto.BulkUploadResponse;
import com.umang.ems_backend.dto.EmployeeDto;
import com.umang.ems_backend.repository.EmployeeRepository;
import com.umang.ems_backend.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin("*")
@AllArgsConstructor
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private EmployeeService employeeService;

    //Add Employee
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto employeeDto){
        EmployeeDto savedEmployee = employeeService.createEmployee(employeeDto);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }

    //Get Employee by ID
    @GetMapping("{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable("id") Long employeeId){
        EmployeeDto employeeDto = employeeService.getEmployeeById(employeeId);
        return ResponseEntity.ok(employeeDto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<Page<EmployeeDto>> getAllEmployees(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir
    ) {
        List<String> departments = department == null || department.trim().isEmpty()
                ? List.of()
                : List.of(department.split(","));
        Page<EmployeeDto> employees = employeeService.getEmployeesPage(page, size, departments, sortDir);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<Page<EmployeeDto>> searchEmployees(
            @RequestParam("query") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Page<EmployeeDto> employees = employeeService.searchEmployees(query, page, size);
        return ResponseEntity.ok(employees);
    }


    @PutMapping("{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable("id") Long employeeId, @RequestBody EmployeeDto updatedEmployee) {
        EmployeeDto employeeDto = employeeService.updateEmployee(employeeId, updatedEmployee);
        return ResponseEntity.ok(employeeDto);
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteEmployee(@PathVariable("id") Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.ok("Employee deleted successfully!");
    }

    @PostMapping("/bulk-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BulkUploadResponse> bulkUploadEmployees(@RequestParam("file") MultipartFile file) {
        BulkUploadResponse response = employeeService.bulkUploadEmployees(file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAllEmployees() {
        employeeService.deleteAllEmployees();
        return ResponseEntity.ok("All employees deleted successfully!");
    }
}
