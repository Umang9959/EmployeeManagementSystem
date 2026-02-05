package com.umang.ems_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponse {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<BulkUploadError> errors;
}
