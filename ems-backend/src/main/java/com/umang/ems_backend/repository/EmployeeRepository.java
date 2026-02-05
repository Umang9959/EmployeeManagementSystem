package com.umang.ems_backend.repository;

import com.umang.ems_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository <Employee, Long>{
	Page<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
			String firstName,
			String lastName,
			String email,
			Pageable pageable
	);

	List<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
			String firstName,
			String lastName,
			String email,
			String phoneNumber
	);

	Page<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
			String firstName,
			String lastName,
			String email,
			String phoneNumber,
			Pageable pageable
	);
	List<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
			String firstName,
			String lastName,
			String email
	);

	Optional<Employee> findByEmailIgnoreCase(String email);

	Optional<Employee> findByPhoneNumber(String phoneNumber);

	Page<Employee> findByDepartmentIn(List<String> departments, Pageable pageable);
}
