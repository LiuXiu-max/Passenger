# -*-coding:utf-8 -*-
import jieba
import jieba.posseg as pseg
import jieba.analyse as anls
import jieba.posseg as posseg
import pymysql.cursors
import redis
import os, threading, time

curTime = time.strftime("%Y-%M-%D", time.localtime())  # 记录当前时间
execF = False
ncount = 0
sumcount = 0


def execTask():
    pool = redis.ConnectionPool(host='127.0.0.1', port=6379, decode_responses=True)
    r = redis.Redis(connection_pool=pool)
    connection = pymysql.connect(host="localhost", port=3306, user='root', passwd='@LiuKunKun123456', db='Passenger', charset='utf8mb4',
                                 cursorclass=pymysql.cursors.DictCursor)

    ###更新游记标签
    print('更新游记标签')
    try:
        cursor = connection.cursor()
        sql = 'select id,name from trips'
        cursor.execute(sql)
        results = cursor.fetchall()
        for row in results:
            print(row['id'])
            print(row['name'])
            for x, w in anls.extract_tags(row['name'], topK=4, withWeight=True,
                                          allowPOS=('nr', 't', 'ns', 'nz', 'ns', 'n')):
                print('%s %s' % (x, int(w)))
                # r.delete(row['id'])
                keyname = 'triptag_' + str(row['id'])
                r.zadd(keyname, {x: int(w)})
            print(r.zrange(keyname, 0, -1, withscores=True))
    except Exception:
        print('查询失败')
    cursor.close()
    ###

    useridList = []
    tripidList = []
    ###获取用户id表,游记id表
    print('获取用户id表,游记id表')
    try:
        cursor = connection.cursor()
        sql = 'select id from users'
        cursor.execute(sql)
        results = cursor.fetchall()
        print(results)
        for row in results:
            useridList.append(row['id'])
            # print(row['id'])
    except Exception:
        print('查询失败')
    cursor.close()
    # for item in useridList:
    #   print(item)
    print(useridList)

    ###获取游记id表
    try:
        cursor = connection.cursor()
        sql = 'select id from trips'
        cursor.execute(sql)
        results = cursor.fetchall()
        for row in results:
            tripidList.append(row['id'])
    except Exception:
        print('查询失败')
    cursor.close()
    connection.close()
    print(tripidList)

    print('计算推荐cos值')
    ###计算推荐cos值
    for useritem in useridList:
        ab = 0
        af = 0
        bf = 0
        cos = 0
        usertag = r.zrange('usertag_' + str(useritem), 0, -1, withscores=True)
        for usertagitem in usertag:
            af = usertagitem[1] * usertagitem[1] + af
        for tripitem in tripidList:
            r.zinterstore('swip', ('usertag_' + str(useritem), 'triptag_' + str(tripitem)))
            jiaoji = r.zrange('swip', 0, -1)
            if (jiaoji == []):
                cos = 0
            else:
                ab = 0
                bf = 0
                cos = 0
                for jiaojiitem in jiaoji:
                    a = r.zscore('usertag_' + str(useritem), jiaojiitem)
                    b = r.zscore('triptag_' + str(tripitem), jiaojiitem)
                    ab = ab + a * b
                    bf = bf + b * b
                    cos = ab / (af ** 0.5 + bf ** 0.5)
            if (useritem == 1):
                print(str(useritem) + ' ' + str(tripitem) + ' ' + str(cos))
            r.zadd('recommend_' + str(useritem), {str(tripitem): cos})
    print(r.zrange('recommend_1', 0, -1, withscores=True))


def timerTask():
    global execF
    global curTime
    global ncount
    global sumcount
    if execF is False:
        execTask()  # 判断任务是否执行过，没有执行就执行
        execF = True
        ncount = 0
    else:  # 任务执行过，判断时间是否新的一天。如果是就执行任务
        desTime = time.strftime("%Y-%M-%D", time.localtime())
        if desTime > curTime:
            execF = False  # 任务执行执行置值为
            curTime = desTime
    ncount = ncount + 1
    sumcount = sumcount + 1
    timer = threading.Timer(3600, timerTask)
    timer.start()
    print("定时器第执行%d次,据上一次过去%d小时" % (sumcount, ncount))


if __name__ == "__main__":
    timer = threading.Timer(3600, timerTask)
    timer.start()
