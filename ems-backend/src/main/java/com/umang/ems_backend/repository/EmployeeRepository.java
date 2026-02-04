package com.umang.ems_backend.repository;

import com.umang.ems_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository <Employee, Long>{
	List<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
			String firstName,
			String lastName,
			String email
	);

	Optional<Employee> findByEmailIgnoreCase(String email);
}
