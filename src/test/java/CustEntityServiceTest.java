import com.alibaba.fastjson.JSONObject;
import com.crm.api.Configuration;
import com.crm.bs.CustEntityService;
import org.apache.commons.lang.StringUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 * Created by yujinliang on 16/9/22.
 */
public class CustEntityServiceTest {
    String access_token="";
    CustEntityService custEntityService;

    @Before
    public void setUp() throws Exception {
        custEntityService= new CustEntityService();
//        access_token = custEntityService.getAuthToken();
        if (StringUtils.isEmpty(access_token))
        access_token = Configuration.getInstance().getValue("access_token");
        System.out.println("access_token=============:"+access_token);
    }

    @After
    public void tearDown() throws Exception {

    }

    @Test
    public void testGetAuthToken(){

    }

    @Test
    public void testGetEnityList(){
        JSONObject result=custEntityService.getEnityList(access_token);
//        System.out.println(result.toJSONString());
    }

    @Test
    public void testGetEnityDetail(){
        JSONObject result=custEntityService.getEnityDetail(access_token,"100018193");
//        System.out.println(result.toJSONString());
    }

    @Test
    public void testetPayRecordEntity(){
        JSONObject result=custEntityService.getPayRecordEntity(access_token);
//        System.out.println(result.toJSONString());
    }

    @Test
    public void testGetPayPlanEntity(){
        JSONObject result=custEntityService.getPayPlanEntity(access_token);
//        System.out.println(result.toJSONString());
    }

    @Test
    public void testCreateData(){
//        custEntityService.createEntityData(access_token,"100018107001",result);
    }
}
