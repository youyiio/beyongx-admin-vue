<template>
  <div style="display: inline-block">
    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" :before-close="cancel" :title="title" append-to-body width="500px" @close="cancel">
      <el-form ref="dataForm" :model="formData" :rules="rules" size="small" label-width="88px">
        <el-form-item label="旧密码" prop="oldPass">
          <el-input v-model="formData.oldPass" type="password" auto-complete="on" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="formData.newPass" type="password" auto-complete="on" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPass">
          <el-input v-model="formData.confirmPass" type="password" auto-complete="on" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogVisible = false">取消</el-button>
        <el-button :loading="loading" type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import store from '@/store'
import { ucenterModifyPwd } from '@/api/system/user'

export default {
  name: 'UserUpdatePwd',
  data() {
    const confirmPass = (rule, value, callback) => {
      if (value) {
        if (this.formData.newPass !== value) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请再次输入密码'))
      }
    }
    return {
      dialogVisible: false,
      loading: false,
      title: '修改密码',
      formData: { oldPass: '', newPass: '', confirmPass: '' },
      rules: {
        oldPass: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPass: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPass: [
          { required: true, validator: confirmPass, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          const saveData = {
            oldPassword: this.formData.oldPass,
            password: this.formData.newPass
          }
          ucenterModifyPwd(saveData).then((res) => {
            this.resetForm()
            this.$notify({
              title: '密码修改成功，请重新登录',
              type: 'success',
              duration: 1500
            })
            setTimeout(() => {
              store.dispatch('Logout').then(() => {
                location.reload() // 为了重新实例化vue-router对象 避免bug
              })
            }, 1500)
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.dialogVisible = false
      this.$refs['dataForm'].resetFields()
      this.formData = { oldPass: '', newPass: '', confirmPass: '' }
    }
  }
}
</script>
