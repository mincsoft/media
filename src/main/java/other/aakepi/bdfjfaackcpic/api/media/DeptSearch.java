package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.test.tool.TestCustomizeApiTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;

import java.io.IOException;

/**
 * 部门查询
 * Created by YuJinliang on 16/10/6.
 */
public class DeptSearch extends BaseApiSupport implements ApiSupport {


    @Override
    public String execute(Request request, Long userId, Long tenantId) {
        JSONArray records = new JSONArray();
        RkhdHttpClient rkhdHttpClient = null;
        try {
            rkhdHttpClient = new RkhdHttpClient();
            RkhdHttpData rkhdHttpData = new RkhdHttpData();
            rkhdHttpData.setCallString("/data/v1/objects/depart/tree");
            rkhdHttpData.setCall_type("GET");
            String resultJson = rkhdHttpClient.performRequest(rkhdHttpData);
            if (StringUtils.isNotBlank(resultJson)) {
                JSONObject object = JSONObject.fromObject(resultJson);
                getDeptList(object, records);
            }


        } catch (IOException e) {
            e.printStackTrace();
        }


        return records.toString();
    }

    private JSONArray getDeptList(JSONObject object, JSONArray records) {
        if (object != null) {
            JSONObject record = new JSONObject();
            record.put("id", object.getString("id"));
            record.put("name", object.getString("name"));
            records.add(record);
            if (object.containsKey("subs") && object.getJSONArray("subs") != null && object.getJSONArray("subs").size() > 0) {
                JSONArray array = object.getJSONArray("subs");
                for (int i = 0; i < array.size(); i++) {
                    getDeptList(array.getJSONObject(i),records);
                }
            }
        }
        return records;
    }


    public static void main(String[] args) {
        TestCustomizeApiTool testTriggerTool = new TestCustomizeApiTool();
        DeptSearch api = new DeptSearch();
        testTriggerTool.test("search-deptlist", api);
    }


}
