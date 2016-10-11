package com;

import java.io.*;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;


/**
 * Created by yangyixin on 16/10/11.
 */
public class ZipUtil {
    /**
     * 压缩文件-由于out要在递归调用外,所以封装一个方法用来
     * 调用ZipFiles(ZipOutputStream out,String path,File... srcFiles)
     * @param zip
     * @param path
     * @param srcFiles
     * @throws IOException
     * @author isea533
     */
    public static void ZipFiles(File zip,String path,File... srcFiles) throws IOException{
        ZipOutputStream out = new ZipOutputStream(new FileOutputStream(zip));
        ZipFiles(out, path, srcFiles);
        out.close();
        System.out.println("*****************压缩完毕*******************");
    }
    /**
     * 压缩文件-File
     * @param zipFile  zip文件
     * @param srcFiles 被压缩源文件
     * @author isea533
     */
    public static void ZipFiles(ZipOutputStream out,String path,File... srcFiles){
        path = path.replaceAll("\\*", "/");
        if(!path.endsWith("/")){
            path+="/";
        }
        byte[] buf = new byte[1024];
        try {
            for(int i=0;i<srcFiles.length;i++){
                if(srcFiles[i].isDirectory()){
                    File[] files = srcFiles[i].listFiles();
                    String srcPath = srcFiles[i].getName();
                    srcPath = srcPath.replaceAll("\\*", "/");
                    if(!srcPath.endsWith("/")){
                        srcPath+="/";
                    }
                    out.putNextEntry(new ZipEntry(path+srcPath));
                    ZipFiles(out,path+srcPath,files);
                }
                else{
                    FileInputStream in = new FileInputStream(srcFiles[i]);
                    System.out.println(path + srcFiles[i].getName());
                    out.putNextEntry(new ZipEntry(path + srcFiles[i].getName()));
                    int len;
                    while((len=in.read(buf))>0){
                        out.write(buf,0,len);
                    }
                    out.closeEntry();
                    in.close();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args){
        String path = "/Users/yangyixin/Documents/workspace/mincsoft/media/src/main/java/";
        String zipPath = "/Users/yangyixin/Documents/workspace/mincsoft/media/target/code.zip";


        try{
            File zip = new File(zipPath);

            ZipFiles(zip,"",new File(path+"other"),new File(path+"/apiUrl.xml"),new File(path+"/scriptTrigger.xml"));

        } catch (Exception e){
            e.printStackTrace();
        }

    }
}
