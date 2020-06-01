import jieba
import jieba.posseg as pseg
import jieba.analyse as anls
import jieba.posseg as posseg
import pymysql.cursors
import redis

pool = redis.ConnectionPool(host='127.0.0.1', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=pool)
connection = pymysql.connect(host="localhost", port=3306, user='root', passwd='@LiuKunKun123456', db='Passenger', charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)


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
    print('query fail')
cursor.close()
connection.close()

