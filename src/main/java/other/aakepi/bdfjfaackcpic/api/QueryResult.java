package other.aakepi.bdfjfaackcpic.api;


import net.sf.json.JSONArray;

import java.io.Serializable;

/**
 * API查询结果对象
 * Created by yangyixin on 16/10/4.
 */
public class QueryResult implements Serializable {
    Integer totalSize;
    Integer count;
    JSONArray records;
    String status;

    public Integer getTotalSize() {
        return totalSize;
    }

    public void setTotalSize(Integer totalSize) {
        this.totalSize = totalSize;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public JSONArray getRecords() {
        return records;
    }

    public void setRecords(JSONArray records) {
        this.records = records;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
