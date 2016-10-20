package other.aakepi.bdfjfaackcpic.util;

import org.apache.commons.lang.StringUtils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

public class DateUtil {


    public  static Date getDate (String date)  {
        return getDate(date,"yyyy-MM-dd");
    }

    public  static Date getDate (String date,String format)  {
        if(StringUtils.isBlank(date)) return null;
        DateFormat formater = new SimpleDateFormat(format);
        try {
            return formater.parse(date);
        } catch (ParseException e) {
            return null;
        }
    }
    /**
     * 按照yyyy-MM-dd 返回日期对象字符串
     * @param date
     * @return
     */
    public static String getDateStr(Date date){
        return getDateStr(date, "yyyy-MM-dd");
    }

    /**
     * 按照yyyy-MM-dd 返回日期对象字符串
     * @param date yyyy-MM-dd HH:mm
     * @return
     */
    public static String getDateStr(String date){
        return StringUtils.left(date,10);
    }
    /**
     * 获得日期格式
     * @param date
     * @param format
     * @return
     */
    public static String getDateStr (Date date,String format)  {
        if (date == null) return "";
        try {
            DateFormat formater = new SimpleDateFormat(format);
            return formater.format(date);
        } catch (Exception e) {
            return "";
        }
    }
    /**
     * 得到两个日期相差的天数
     */
    public static int getBetweenDay(Date date1, Date date2) {
        Calendar d1 = new GregorianCalendar();
        d1.setTime(date1);
        Calendar d2 = new GregorianCalendar();
        d2.setTime(date2);
        int days = d2.get(Calendar.DAY_OF_YEAR)- d1.get(Calendar.DAY_OF_YEAR);
        System.out.println("days="+days);
        int y2 = d2.get(Calendar.YEAR);
        if (d1.get(Calendar.YEAR) != y2) {
            do {
                days += d1.getActualMaximum(Calendar.DAY_OF_YEAR);
                d1.add(Calendar.YEAR, 1);
            } while (d1.get(Calendar.YEAR) != y2);
        }
        return days;
    }

    public static boolean isBefore(Date date1, Date date2){
        return date1.before(date2);
    }



    /**
     * 获取一个月内结束
     * @return
     * @throws ParseException
     */
    public static Date getOneMonthEnd()  {
        Calendar minCal = Calendar.getInstance();
        minCal.add(Calendar.DAY_OF_MONTH,30);
        minCal.set(Calendar.HOUR_OF_DAY, 23);
        minCal.set(Calendar.MINUTE,59);
        minCal.set(Calendar.SECOND,59);
        minCal.set(Calendar.MILLISECOND,0);

        return minCal.getTime();
    }

    /**
     * 获取两月内开始
     * @return
     * @throws ParseException
     */
    public static Date getTwoMonthStart()  {
        Calendar minCal = Calendar.getInstance();
        minCal.add(Calendar.DAY_OF_MONTH,31);
        minCal.set(Calendar.HOUR_OF_DAY, 0);
        minCal.set(Calendar.MINUTE,0);
        minCal.set(Calendar.SECOND,0);
        minCal.set(Calendar.MILLISECOND,0);

        return minCal.getTime();
    }

    /**
     * 获取两月内结束
     * @return
     * @throws ParseException
     */
    public static Date getTwoMonthEnd()  {
        Calendar minCal = Calendar.getInstance();
        minCal.add(Calendar.DAY_OF_MONTH, 60);
        minCal.set(Calendar.HOUR_OF_DAY,23);
        minCal.set(Calendar.MINUTE,59);
        minCal.set(Calendar.SECOND,59);
        minCal.set(Calendar.MILLISECOND,0);

        return minCal.getTime();
    }

    /**
     * 获取三月内开始
     * @return
     * @throws ParseException
     */
    public static Date getThreeMonthStart()  {
        Calendar minCal = Calendar.getInstance();
        minCal.add(Calendar.DAY_OF_MONTH,61);
        minCal.set(Calendar.HOUR_OF_DAY, 0);
        minCal.set(Calendar.MINUTE,0);
        minCal.set(Calendar.SECOND,0);
        minCal.set(Calendar.MILLISECOND,0);

        return minCal.getTime();
    }

    /**
     * 获取三月内结束
     * @return
     * @throws ParseException
     */
    public static Date getThreeMonthEnd()  {
        Calendar minCal = Calendar.getInstance();
        minCal.add(Calendar.DAY_OF_MONTH, 90);
        minCal.set(Calendar.HOUR_OF_DAY,23);
        minCal.set(Calendar.MINUTE,59);
        minCal.set(Calendar.SECOND,59);
        minCal.set(Calendar.MILLISECOND,0);

        return minCal.getTime();
    }

    /**
     * 获取当日起始时间
     * @return
     * @throws ParseException
     */
    public static Date  getTodayStart()  {

        return getDestdayStart(Calendar.getInstance().getTime());
    }

    /**
     * 获取当日起始时间
     * @return
     * @throws ParseException
     */
    public static Date  getDestdayStart(Date date)  {
        Calendar minCal = Calendar.getInstance();
        minCal.setTime(date);
        minCal.set(Calendar.HOUR_OF_DAY, 0);
        minCal.set(Calendar.MINUTE,0);
        minCal.set(Calendar.SECOND,0);
        minCal.set(Calendar.MILLISECOND,0);

        return minCal.getTime();
    }

    /**
     * 获取当日结束时间
     * @return
     */
    public static Date  getDestdayEnd(Date date)  {
        Calendar minCal = Calendar.getInstance();
        minCal.setTime(date);
        minCal.set(Calendar.HOUR_OF_DAY,23);
        minCal.set(Calendar.MINUTE,59);
        minCal.set(Calendar.SECOND,59);
        return minCal.getTime();
    }


    public static void main(String[] args) {
        String a = "ab1";
        String b = "a" + "b" + 1;
        String d = "ab";
        String e = d + 1;
        final String f = "ab";
        String g = f+1;
        System.out.println(a==b);
        System.out.println(a==e);
        System.out.println(a==g);
    }
}
