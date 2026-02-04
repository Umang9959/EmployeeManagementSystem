import axios from "axios";

const REST_API_BASE_URL = 'http://localhost:8081/api/employees';

export const listEmployees = (page = 0, size = 20) =>
	axios.get(REST_API_BASE_URL, { params: { page, size } });

export const searchEmployees = (query, page = 0, size = 20) =>
	axios.get(REST_API_BASE_URL + '/search', { params: { query, page, size } });

export const createEmployee = (employee) => axios.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) => axios.get(REST_API_BASE_URL + '/' + employeeId);

export const updateEmployee = (employeeId, employee) => axios.put(REST_API_BASE_URL + '/' + employeeId, employee);

export const deleteEmployee = (employeeId) => axios.delete(REST_API_BASE_URL + '/' + employeeId);