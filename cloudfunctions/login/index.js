const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async () => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const now = new Date()
  const openid = wxContext.OPENID

  if (openid) {
    const userData = {
      openid,
      appid: wxContext.APPID || '',
      unionid: wxContext.UNIONID || '',
      lastLoginAt: now,
      updatedAt: now
    }

    const existed = await db.collection('users').where({ openid }).limit(1).get()
    if (existed.data && existed.data.length > 0) {
      await db.collection('users').doc(existed.data[0]._id).update({
        data: userData
      })
    } else {
      await db.collection('users').add({
        data: Object.assign({}, userData, {
          createdAt: now
        })
      })
    }
  }

  return {
    openid,
    appid: wxContext.APPID || '',
    unionid: wxContext.UNIONID || '',
    loginAt: now.toISOString()
  }
}
