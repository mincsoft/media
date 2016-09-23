import com.alibaba.fastjson.JSONObject;
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
        access_token = custEntityService.getAuthToken();
        if (StringUtils.isEmpty(access_token))
        access_token = "b41b934d448a36ac85db23ede2f3120ede2a56b4db9b4b61076d17d3313bdc14";
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
        System.out.println(result.toJSONString());
    }

    @Test
    public void testGetEnityDetail(){
        JSONObject result=custEntityService.getEnityDetail(access_token,"100018107");
        System.out.println(result.toJSONString());
    }

    @Test
    public void testCreateEnity(){
        JSONObject result=custEntityService.getEnityDetail(access_token,"100018107");
        custEntityService.createEnity(access_token,"100018107001",result);
        System.out.println(result.toJSONString());
    }
}
