import apiClient from "./apiClient";

const REST_API_BASE_URL = 'http://localhost:8081/api/employees';

export const listEmployees = (page = 0, size = 20) =>
	apiClient.get(REST_API_BASE_URL, { params: { page, size } });

export const searchEmployees = (query, page = 0, size = 20) =>
	apiClient.get(REST_API_BASE_URL + '/search', { params: { query, page, size } });

export const createEmployee = (employee) => apiClient.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) => apiClient.get(REST_API_BASE_URL + '/' + employeeId);

export const updateEmployee = (employeeId, employee) => apiClient.put(REST_API_BASE_URL + '/' + employeeId, employee);

export const deleteEmployee = (employeeId) => apiClient.delete(REST_API_BASE_URL + '/' + employeeId);

export const bulkUploadEmployees = (file) => {
	const formData = new FormData();
	formData.append('file', file);
	return apiClient.post(REST_API_BASE_URL + '/bulk-upload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
};

export const deleteAllEmployees = () => apiClient.delete(REST_API_BASE_URL);