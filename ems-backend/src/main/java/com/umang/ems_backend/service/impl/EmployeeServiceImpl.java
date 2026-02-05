package com.umang.ems_backend.service.impl;

import com.umang.ems_backend.dto.BulkUploadError;
import com.umang.ems_backend.dto.BulkUploadResponse;
import com.umang.ems_backend.dto.EmployeeDto;
import com.umang.ems_backend.entity.Employee;
import com.umang.ems_backend.exception.DuplicateResourceException;
import com.umang.ems_backend.exception.ResourceNotFoundException;
import com.umang.ems_backend.mapper.EmployeeMapper;
import com.umang.ems_backend.repository.EmployeeRepository;
import com.umang.ems_backend.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
        if (employeeDto.getPhoneNumber() != null && employeeRepository.findByPhoneNumber(employeeDto.getPhoneNumber().trim()).isPresent()) {
            throw new DuplicateResourceException("Phone number already exists");
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
    public Page<EmployeeDto> getEmployeesPage(int page, int size, List<String> departments, String sortDir) {
        List<String> normalizedDepartments = departments == null
                ? List.of()
                : departments.stream()
                    .filter(value -> value != null && !value.trim().isEmpty())
                    .map(String::trim)
                    .toList();
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, "firstName"));

        Page<Employee> employees;
        if (normalizedDepartments.isEmpty()) {
            employees = employeeRepository.findAll(pageRequest);
        } else {
            employees = employeeRepository.findByDepartmentIn(normalizedDepartments, pageRequest);
        }
        return employees.map(EmployeeMapper::maptoEmployeeDto);
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
        if (updatedEmployee.getPhoneNumber() != null) {
            employeeRepository.findByPhoneNumber(updatedEmployee.getPhoneNumber().trim())
                    .filter(existing -> !existing.getId().equals(employeeId))
                    .ifPresent(existing -> {
                        throw new DuplicateResourceException("Phone number already exists");
                    });
        }
        employee.setFirstName(updatedEmployee.getFirstName());
        employee.setLastName(updatedEmployee.getLastName());
        employee.setEmail(updatedEmployee.getEmail());
        employee.setPhoneNumber(updatedEmployee.getPhoneNumber());
        employee.setDepartment(updatedEmployee.getDepartment());

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
            .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
                        searchValue,
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

    @Override
    public Page<EmployeeDto> searchEmployees(String query, int page, int size) {
        String searchValue = query == null ? "" : query.trim();
        if (searchValue.isEmpty()) {
            return getEmployeesPage(page, size, List.of(), "asc");
        }

        if (searchValue.matches("\\d+")) {
            Long id = Long.parseLong(searchValue);
            Optional<Employee> employeeById = employeeRepository.findById(id);
            if (employeeById.isPresent()) {
                EmployeeDto dto = EmployeeMapper.maptoEmployeeDto(employeeById.get());
                return new PageImpl<>(List.of(dto), PageRequest.of(page, size), 1);
            }
        }

        Page<Employee> employees = employeeRepository
            .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
                        searchValue,
                        searchValue,
                        searchValue,
                searchValue,
                        PageRequest.of(page, size)
                );

        return employees.map(EmployeeMapper::maptoEmployeeDto);
    }

    @Override
    public BulkUploadResponse bulkUploadEmployees(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Excel file is required");
        }

        String fileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only .xlsx or .xls files are supported");
        }

        List<Employee> employeesToSave = new ArrayList<>();
        List<BulkUploadError> errors = new ArrayList<>();
        Set<String> emailsInFile = new HashSet<>();
        Set<String> phonesInFile = new HashSet<>();
        DataFormatter formatter = new DataFormatter();
        int totalRows = 0;

        try (InputStream inputStream = file.getInputStream(); Workbook workbook = WorkbookFactory.create(inputStream)) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Excel file does not contain any sheets");
            }

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Header row is missing");
            }

            Map<String, Integer> headerIndex = buildHeaderIndex(headerRow, formatter);

            Integer firstNameIndex = findHeaderIndex(headerIndex, "first name", "firstname", "first_name");
            Integer lastNameIndex = findHeaderIndex(headerIndex, "last name", "lastname", "last_name");
            Integer emailIndex = findHeaderIndex(headerIndex, "email", "email id", "email_id", "email address", "email_address");
            Integer phoneIndex = findHeaderIndex(headerIndex, "phone", "phone number", "phone_number", "mobile", "mobile number", "mobile_number");
            Integer departmentIndex = findHeaderIndex(headerIndex, "department", "dept");

            List<String> missingColumns = new ArrayList<>();
            if (firstNameIndex == null) missingColumns.add("firstName");
            if (lastNameIndex == null) missingColumns.add("lastName");
            if (emailIndex == null) missingColumns.add("email");
            if (phoneIndex == null) missingColumns.add("phoneNumber");
            if (departmentIndex == null) missingColumns.add("department");

            if (!missingColumns.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Missing required columns: " + String.join(", ", missingColumns)
                );
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowBlank(row, formatter)) {
                    continue;
                }

                totalRows++;
                int excelRowNumber = rowIndex + 1;

                String firstName = getCellString(row, firstNameIndex, formatter);
                String lastName = getCellString(row, lastNameIndex, formatter);
                String email = getCellString(row, emailIndex, formatter);
                String phoneNumber = getCellString(row, phoneIndex, formatter);
                String department = getCellString(row, departmentIndex, formatter);

                if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || phoneNumber.isBlank() || department.isBlank()) {
                    errors.add(new BulkUploadError(excelRowNumber, "All fields are required"));
                    continue;
                }

                String normalizedEmail = email.trim().toLowerCase();
                String normalizedPhone = phoneNumber.trim();

                if (!emailsInFile.add(normalizedEmail)) {
                    errors.add(new BulkUploadError(excelRowNumber, "Duplicate email in file"));
                    continue;
                }

                if (!phonesInFile.add(normalizedPhone)) {
                    errors.add(new BulkUploadError(excelRowNumber, "Duplicate phone number in file"));
                    continue;
                }

                if (employeeRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
                    errors.add(new BulkUploadError(excelRowNumber, "Email already exists"));
                    continue;
                }

                if (employeeRepository.findByPhoneNumber(normalizedPhone).isPresent()) {
                    errors.add(new BulkUploadError(excelRowNumber, "Phone number already exists"));
                    continue;
                }

                Employee employee = new Employee();
                employee.setFirstName(firstName.trim());
                employee.setLastName(lastName.trim());
                employee.setEmail(email.trim());
                employee.setPhoneNumber(normalizedPhone);
                employee.setDepartment(department.trim());
                employeesToSave.add(employee);
            }

            if (!employeesToSave.isEmpty()) {
                employeeRepository.saveAll(employeesToSave);
            }

        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read Excel file");
        }

        return new BulkUploadResponse(
                totalRows,
                employeesToSave.size(),
                errors.size(),
                errors
        );
    }

    @Override
    public void deleteAllEmployees() {
        employeeRepository.deleteAll();
    }

    private Map<String, Integer> buildHeaderIndex(Row headerRow, DataFormatter formatter) {
        Map<String, Integer> headerIndex = new HashMap<>();
        for (Cell cell : headerRow) {
            String header = formatter.formatCellValue(cell).trim().toLowerCase();
            if (!header.isBlank()) {
                headerIndex.put(header, cell.getColumnIndex());
            }
        }
        return headerIndex;
    }

    private Integer findHeaderIndex(Map<String, Integer> headerIndex, String... candidates) {
        for (String candidate : candidates) {
            Integer index = headerIndex.get(candidate.toLowerCase());
            if (index != null) {
                return index;
            }
        }
        return null;
    }

    private String getCellString(Row row, Integer index, DataFormatter formatter) {
        if (index == null) {
            return "";
        }
        Cell cell = row.getCell(index);
        if (cell == null) {
            return "";
        }
        return formatter.formatCellValue(cell).trim();
    }

    private boolean isRowBlank(Row row, DataFormatter formatter) {
        if (row == null) {
            return true;
        }
        short lastCell = row.getLastCellNum();
        if (lastCell <= 0) {
            return true;
        }
        for (int cellIndex = 0; cellIndex < lastCell; cellIndex++) {
            Cell cell = row.getCell(cellIndex);
            if (cell != null && !formatter.formatCellValue(cell).trim().isBlank()) {
                return false;
            }
        }
        return true;
    }
}
