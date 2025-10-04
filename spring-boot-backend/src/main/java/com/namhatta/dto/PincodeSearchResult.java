package com.namhatta.dto;

import java.util.List;

public class PincodeSearchResult {
    private List<AddressDTO> pincodes;
    private Long total;
    private Boolean hasMore;
    
    public PincodeSearchResult() {
    }
    
    public PincodeSearchResult(List<AddressDTO> pincodes, Long total, Boolean hasMore) {
        this.pincodes = pincodes;
        this.total = total;
        this.hasMore = hasMore;
    }
    
    public List<AddressDTO> getPincodes() { return pincodes; }
    public void setPincodes(List<AddressDTO> pincodes) { this.pincodes = pincodes; }
    
    public Long getTotal() { return total; }
    public void setTotal(Long total) { this.total = total; }
    
    public Boolean getHasMore() { return hasMore; }
    public void setHasMore(Boolean hasMore) { this.hasMore = hasMore; }
}
