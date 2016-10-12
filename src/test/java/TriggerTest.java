import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import other.aakepi.bdfjfaackcpic.trigger.mediaKeeping.SaveMediaKeeping;
import other.aakepi.bdfjfaackcpic.trigger.mediaKeeping.SaveMediaKeepingAfter;

/**
 * Created by yangyixin on 16/10/11.
 */
public class TriggerTest {

    public static void testSaveMediaKepping(String scriptTrigger){
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        SaveMediaKeeping trigger = new SaveMediaKeeping();
        testTriggerTool.test(scriptTrigger, trigger);
    }

    public static void testSaveMediaKeppingAfter(String scriptTrigger){
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        SaveMediaKeepingAfter trigger = new SaveMediaKeepingAfter();
        testTriggerTool.test(scriptTrigger, trigger);
    }


    public static void main(String[] args) {
        String scriptTrigger = "/Users/yangyixin/Documents/workspace/mincsoft/media/src/main/java/scriptTrigger.xml";
        //媒体保留，新增
//        testSaveMediaKepping(scriptTrigger);
        //媒体保留，新增后保存点位
        testSaveMediaKeppingAfter(scriptTrigger);

    }
}
