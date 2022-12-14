<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="5" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div style="text-align: center">
              <div class="el-upload">
                <img :src="user.headUrl ? baseUrl + user.headUrl : Avatar" title="点击上传头像" class="avatar" @click="toggleShow">
                <imageUpload ref="imageUpload" field="file" :model-value.sync="uploadShow" :url="baseApi + '/image/upload'" :headers="headers" @crop-success="cropSuccess" @crop-upload-success="cropUploadSuccess" @crop-upload-fail="cropUploadFail" />
              </div>
            </div>
            <ul class="user-info">
              <li>
                <div style="height: 100%">
                  <svg-icon icon-class="login" /> 登录账号
                  <div class="user-right"> {{ user.account }} </div>
                </div>
              </li>
              <li>
                <svg-icon icon-class="user1" /> 用户昵称
                <div class="user-right"> {{ user.nickname }} </div>
              </li>
              <li>
                <svg-icon icon-class="user1" /> 我的签名
                <div class="user-right"> {{ user.description }} </div>
              </li>
              <li>
                <svg-icon icon-class="dept" /> 所属部门
                <div class="user-right"> {{ user.dept ? user.dept.title : '' }} </div>
              </li>
              <li>
                <svg-icon icon-class="phone" /> 手机号码
                <div class="user-right"> {{ user.mobile }} </div>
              </li>
              <li>
                <svg-icon icon-class="email" /> 用户邮箱
                <div class="user-right"> {{ user.email }} </div>
              </li>
              <li>
                <svg-icon icon-class="role" /> 用户权限
                <div class="user-right">
                  <span v-for="role in user.roles" :key="role.id"> {{ role.title }} </span>
                </div>
              </li>
              <li>
                <svg-icon icon-class="anq" /> 安全设置
                <div class="user-right">
                  <a @click="$refs.updatePwd.dialogVisible = true">修改密码</a>
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="19">
        <el-card class="box-card">
          <el-tabs v-model="activeName">
            <el-tab-pane label="用户资料" name="first">
              <el-form ref="dataForm" :model="formData" :rules="rules" style="margin-top: 10px;" size="small" label-width="65px">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="formData.nickname" style="width: 35%" />
                  <span style="color: #C0C0C0;margin-left: 10px;">用户昵称不作为登录使用</span>
                </el-form-item>
                <el-form-item label="签名" prop="description">
                  <el-input v-model="formData.description" style="width: 35%;" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="formData.sex" style="width: 178px">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="QQ" prop="qq">
                  <el-input v-model="formData.qq" style="width: 35%;" />
                </el-form-item>
                <el-form-item label="微信" prop="weixin">
                  <el-input v-model="formData.weixin" style="width: 35%;" />
                </el-form-item>
                <el-form-item label="">
                  <el-button :loading="saveLoading" size="mini" type="primary" @click="handleSaveForm()">保存配置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <updatePwd ref="updatePwd" />
  </div>
</template>

<script>
import { userProfile } from '@/api/system/user'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import Avatar from '@/assets/images/avatar.png'
import updatePwd from './updatePwd'
import imageUpload from 'vue-image-crop-upload'
import store from '@/store'

export default {
  name: 'UserCenter',
  components: { updatePwd, imageUpload },
  data() {
    return {
      uploadShow: false,
      Avatar: Avatar,
      activeName: 'first',
      saveLoading: false,
      headers: {
        'Authorization': getToken()
      },
      formData: {},
      rules: {
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'baseUrl',
      'baseApi',
      'user'
    ])
  },
  created() {
    this.formData = {
      id: this.user.id,
      nickname: this.user.nickname,
      description: this.user.description,
      sex: this.user.sex,
      headUrl: this.user.headUrl,
      qq: this.user.qq,
      weixin: this.user.weixin
    }
  },
  methods: {
    toggleShow() {
      this.uploadShow = !this.uploadShow
      this.$refs.imageUpload.setStep(1)
    },
    handleSaveForm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.saveLoading = true
          userProfile(this.formData).then((res) => {
            this.$message({
              message: '用户资料保存成功！',
              type: 'success'
            })
            store.dispatch('GetInfo').then(() => {})
            this.saveLoading = false
          }).catch(() => {
            this.saveLoading = false
          })
        } else {
          return false
        }
      })
    },
    cropSuccess(imgDataUrl, field) {},
    cropUploadSuccess(jsonData, field) {
      if (jsonData.code !== 1) {
        this.$refs.imageUpload.loading = 3
        this.$refs.imageUpload.hasError = true
        this.$refs.imageUpload.errorMsg = jsonData.msg
      } else {
        this.formData.headUrl = jsonData.data.fileUrl
        this.handleSaveForm()
      }
    },
    cropUploadFail(status, field) {}

  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
  }
  .user-info {
    padding-left: 0;
    list-style: none;
    li{
      border-bottom: 1px solid #F0F3F4;
      padding: 11px 0;
      font-size: 13px;
    }
    .user-right {
      float: right;
      a{
        color: #317EF3;
      }
    }
  }
</style>
