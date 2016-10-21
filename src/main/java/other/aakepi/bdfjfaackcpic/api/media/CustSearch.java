package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.test.tool.TestCustomizeApiTool;
import net.sf.json.JSONArray;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;

/**
 * 部门查询
 * Created by YuJinliang on 16/10/6.
 */
public class CustSearch extends BaseApiSupport implements ApiSupport {


    @Override
    public String execute(Request request, Long userId, Long tenantId) {
        String sql = "select id,accountName from account";

        JSONArray records=queryResultArray(sql);

        return records.toString();
    }

    public static void main(String[] args) {
        TestCustomizeApiTool testTriggerTool = new TestCustomizeApiTool();
        CustSearch api = new CustSearch();
        testTriggerTool.test("search-deptlist", api);
    }


}
