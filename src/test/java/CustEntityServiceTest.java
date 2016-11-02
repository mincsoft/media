import net.sf.json.JSONArray;
import org.junit.Before;
import org.junit.Test;
import other.aakepi.bdfjfaackcpic.api.QueryResult;

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
//        if (StringUtils.isEmpty(access_token))
//        access_token = Configuration.getInstance().getValue("access_token");
//        logger.debug("access_token=============:"+access_token);
    }



//    @After
//    public void tearDown() throws Exception {
//
//    }
//
    @Test
    public void testGetAuthToken(){

    }
//
    @Test
    public void testGetEnityList(){
        QueryResult result=custEntityService.getEnityList(access_token);
        logger.debug(result.getRecords());
    }
//
//    @Test
//    public void testGetEnityDetail(){
//        JSONObject result=custEntityService.getEnityDetail(100018193L);
////        logger.debug(result.toJSONString());
//    }
//
//    @Test
//    public void testetPayRecordEntity(){
//        JSONObject result=custEntityService.getPayRecordEntity();
////        logger.debug(result.toJSONString());
//    }
//
//    @Test
//    public void testGetPayPlanEntity(){
//        JSONObject result=custEntityService.getPayPlanEntity();
////        logger.debug(result.toJSONString());
//    }
//
//    @Test
//    public void testCreateData(){
////        custEntityService.createEntityData(access_token,"100018107001",result);
//    }

    @Test
    public void testqueryData(){
        JSONArray array = custEntityService.queryData();
        logger.debug("========="+array.toString());
    }
}
