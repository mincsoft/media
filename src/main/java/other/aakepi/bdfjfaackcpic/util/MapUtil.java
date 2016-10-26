package other.aakepi.bdfjfaackcpic.util;

import net.sf.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import static java.lang.Math.PI;

public class MapUtil {

    private static final  double EARTH_RADIUS = 6371000;

    private static double rad(double d) {
        return d * PI / 180.0;
    }

    public static double getDistance(double lon1,double lat1,double lon2, double lat2) {
        double radLat1 = rad(lat1);
        double radLat2 = rad(lat2);
        double a = radLat1 - radLat2;
        double b = rad(lon1) - rad(lon2);
        double s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2)+Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    }

    /**
     * 计算经纬度点对应正方形4个点的坐标
     *
     * @param longitude
     * @param latitude
     * @param distance
     * @return
     */
    public static Map<String, double[]> getLLSquarePoint(double longitude,
                                                            double latitude, double distance) {
        Map<String, double[]> squareMap = new HashMap<String, double[]>();
        // 计算经度弧度,从弧度转换为角度
        double dLongitude = 2 * (Math.asin(Math.sin(distance
                / (2 * EARTH_RADIUS))
                / Math.cos(Math.toRadians(latitude))));
        dLongitude = Math.toDegrees(dLongitude);
        // 计算纬度角度
        double dLatitude = distance / EARTH_RADIUS;
        dLatitude = Math.toDegrees(dLatitude);
        // 正方形
        double[] leftTopPoint = {latitude + dLatitude, longitude - dLongitude};
        double[] rightTopPoint = {latitude + dLatitude, longitude + dLongitude};
        double[] leftBottomPoint = {latitude - dLatitude,
                longitude - dLongitude};
        double[] rightBottomPoint = {latitude - dLatitude,
                longitude + dLongitude};
        squareMap.put("leftTopPoint", leftTopPoint);
        squareMap.put("rightTopPoint", rightTopPoint);
        squareMap.put("leftBottomPoint", leftBottomPoint);
        squareMap.put("rightBottomPoint", rightBottomPoint);
        return squareMap;
    }

    public static JSONObject getSquareRange(double longitude,
                                            double latitude, double distance){
        Map map=getLLSquarePoint(longitude, latitude, distance);
        JSONObject result=new JSONObject();
        if (map!=null)
        result.put("lngL",((double[])map.get("leftTopPoint"))[1]);
        result.put("lngR",((double[])map.get("rightTopPoint"))[1]);
        result.put("latB",((double[])map.get("rightBottomPoint"))[0]);
        result.put("latT",((double[])map.get("rightTopPoint"))[0]);

        return result;
    }

    public static void main(String[] args) {
        Map map=MapUtil.getLLSquarePoint(116.372287, 40.003798, 1000);
        System.out.println("leftTopPoint======="+((double[])map.get("leftTopPoint"))[0]+","+((double[])map.get("leftTopPoint"))[1]);
        System.out.println("leftBottomPoint======="+((double[])map.get("leftBottomPoint"))[0]+","+((double[])map.get("leftBottomPoint"))[1]);
        System.out.println("rightTopPoint======="+((double[])map.get("rightTopPoint"))[0]+","+((double[])map.get("rightTopPoint"))[1]);
        System.out.println("rightBottomPoint======="+((double[])map.get("rightBottomPoint"))[0]+","+((double[])map.get("rightBottomPoint"))[1]);

//        double s = MapUtil.getDistance(116.31358468468449,40.04876408029594,116.31358468468449,39.95883191970407);
//        System.out.println("dist======"+s);
        System.out.println("range======"+MapUtil.getSquareRange(116.372287, 40.003798, 1000));


    }
}
