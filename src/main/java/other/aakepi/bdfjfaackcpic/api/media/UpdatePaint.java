package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;

/**
 * Created by yujinliang on 2016/11/11.
 */
public class UpdatePaint extends BaseApiSupport implements ApiSupport {

    @Override
    public String execute(Request request, Long aLong, Long aLong1) {
        String ids = request.getParameter("ids");
        JSONObject result = new JSONObject();
        if (StringUtils.isNotBlank(ids)){
            String[] idArray = ids.split(",");
            JSONObject paint = null;
            for (int i = 0; i < idArray.length; i++) {
                paint = new JSONObject();
                paint.put("id", idArray[i]);
                paint.put("status", 2);

                result = updateBelongs(paint);
            }
        }

        return result.toString();
    }
}
