package other.aakepi.bdfjabipeepce.util;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

public class DateUtil {
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
