<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="searchToggle">
        <el-form ref="searchForm" :model="listQuery.filters" :inline="true">
          <el-form-item prop="nickname">
            <el-input v-model="listQuery.filters.nickname" clearable size="mini" placeholder="输入昵称搜索" style="width: 150px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="mobile">
            <el-input v-model="listQuery.filters.mobile" clearable size="mini" placeholder="输入手机号搜索" style="width: 150px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="email">
            <el-input v-model="listQuery.filters.email" clearable size="mini" placeholder="输入邮箱搜索" style="width: 150px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="listQuery.filters.status" clearable size="mini" placeholder="状态" style="width: 90px" class="filter-item">
              <el-option v-for="status in statusOptions" :key="status" :label="status | statusFilter" :value="status" />
            </el-select>
          </el-form-item>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter()"> 搜索 </el-button>
          <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="handleReset()">重置</el-button>
        </el-form>
      </div>
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['user:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button v-permission="['user:edit']" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="userSelections.length !== 1" @click="handleUpdate(userSelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['user:delete']" :title="`确认删除所选${userSelections.length}条数据吗？`" @onConfirm="handleDelete(userSelections[0])">
            <el-button slot="reference" class="filter-item" size="mini" type="danger" icon="el-icon-delete" :disabled="userSelections.length !== 1 || userSelections[0]['status'] === -1"> 删除 </el-button>
          </el-popconfirm>
          <el-button v-permission="['user:updatePassword']" class="filter-item" size="mini" type="warning" icon="el-icon-key" :disabled="userSelections.length !== 1" @click="handlePwdUpdate(userSelections[0])"> 密码修改 </el-button>
        </span>
        <el-button-group class="crud-opts-right">
          <el-button size="mini" plain type="info" icon="el-icon-search" @click="toggleSearch()" />
          <el-button size="mini" icon="el-icon-refresh" @click="getUserList()" />
          <el-popover placement="bottom-end" width="150" trigger="click">
            <el-button slot="reference" size="mini" icon="el-icon-s-grid">
              <i class="fa fa-caret-down" aria-hidden="true" />
            </el-button>
            <el-checkbox v-model="allColumnsSelected" :indeterminate="allColumnsSelectedIndeterminate" @change="handleCheckAllChange"> 全选 </el-checkbox>
            <el-checkbox />
          </el-popover>
        </el-button-group>
      </div>
    </div>
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '用户'" width="600px">
      <el-form ref="dataForm" :inline="true" :model="formData" :rules.sync="rules" status-icon size="small" label-width="80px">
        <el-form-item label="用户名" prop="account">
          <el-input v-model="formData.account" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model.number="formData.mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model.number="formData.sex" style="width: 178px">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="状态" v-if="dialogStatus === 'update'">
          <el-radio-group v-model.number="formData.status" :disabled="formData.id === user.id" style="width: 178px">
            <el-radio :label="2">激活</el-radio>
            <el-radio :label="3">冻结</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="部门" prop="deptId">
          <treeselect v-model="formData.deptId" :options="deptOptions" :load-options="loadChildrenDept" :normalizer="normalizer" style="width: 250px;" :searchable="false" placeholder="选择部门" />
        </el-form-item>
        <el-form-item label="岗位" prop="jobIds">
          <el-select v-model="formData.jobIds" style="width: 250px" multiple placeholder="请选择岗位">
            <el-option v-for="job in jobData" :key="job.id" :label="job.title" :value="job.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" :disabled="formData.id === user.id" style="width: 437px" multiple placeholder="请选择">
            <el-option v-for="item in rolesData" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="登录密码" prop="password">
          <el-input v-model="formData.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>
    <!-- 密码修改 -->
    <el-dialog
      :visible.sync="dialogPwdVisible"
      :close-on-click-modal="false"
      title="密码修改"
      append-to-body
      width="500px"
    >
      <el-form ref="pwdDataForm" :model="pwdFormData" :rules="pwdRules" size="small" label-width="88px">
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="pwdFormData.newPwd" type="password" auto-complete="on" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <el-input v-model="pwdFormData.confirmPwd" type="password" auto-complete="on" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogPwdVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePwdConfirm()">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="userTable" :key="tableKey" v-loading="listLoading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column :selectable="checkboxDisabled" type="selection" width="50" />
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="用户名" :show-overflow-tooltip="true" prop="account" width="120" />
      <el-table-column label="昵称" :show-overflow-tooltip="true" prop="nickname" width="120" />
      <el-table-column label="手机号" prop="mobile" width="120" />
      <el-table-column label="邮箱" :show-overflow-tooltip="true" prop="email" width="180" />
      <!-- <el-table-column label="部门" prop="dept.title" width="80" /> -->
      <el-table-column label="用户角色">
        <template slot-scope="{ row }">
          <span v-for="(role, index) in row.roles" :key="index">
            <el-tag v-if="role" type="info" size="mini" effect="plain">{{ role.title }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" width="50">
        <template slot-scope="{ row }">
          <span> {{ row.sex | sexFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="{ row }">
          <span> {{ row.status | statusFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="启用" align="center" prop="freeze" width="80px">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.freeze" :disabled="user.id === scope.row.id" active-color="#409EFF" inactive-color="#F56C6C" @change="changeFreeze(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="注册时间" prop="registerTime" width="150" />
      <el-table-column label="最后登录" prop="lastLoginTime" width="150" />
      <el-table-column label="登录IP" prop="lastLoginIp" width="120" />
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="{ row }">
          <el-button v-permission="['user:edit']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-popconfirm v-permission="['user:delete']" style="margin-left: 10px" title="确认删除本条数据吗？" @onConfirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" :disabled="row.status === statusOptions[0] || row.id === user.id" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getUserList()" />
  </div>
</template>

<script>
import { userCreate, userDelete, userFreeze, userList, userModifyPwd, userUnfreeze, userUpdate } from '@/api/system/user'
import { roleList } from '@/api/system/role'
import { deptList } from '@/api/system/dept'
import { jobList } from '@/api/system/job'
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
import Treeselect from '@riophae/vue-treeselect'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const defaultFormData = {
  id: undefined,
  account: '',
  nickname: '',
  mobile: '',
  email: '',
  sex: 1,
  // status: 2,
  deptId: null,
  jobIds: [],
  roleIds: [],
  password: '',
  confirmPassword: ''
}

const defaultListQuery = {
  page: 1,
  size: 20,
  filters: {
    nickname: undefined,
    mobile: undefined,
    email: undefined,
    status: undefined
  }
}

const deptDefaultListQuery = {
  page: 1,
  size: 50,
  filters: {
    struct: 'tree',
    pid: 0,
    depth: 1
  }
}

export default {
  name: 'UserIndex',
  components: { Pagination, Treeselect },
  filters: {
    statusFilter(status) {
      const statusMap = {
        undefined: '-',
        '-1': '已删除',
        1: '申请中',
        2: '已激活',
        3: '冻结中'
      }
      return statusMap[status]
    },
    sexFilter(sex) {
      const sexMap = {
        undefined: '-',
        1: '男',
        2: '女',
        3: '未知'
      }
      return sexMap[sex]
    }
  },
  data() {
    // 自定义验证规则
    var validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.formData.confirmPassword !== '') {
          this.$refs.dataForm.validateField('confirmPassword')
        }
        callback()
      }
    }
    var validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认密码'))
      } else if (value !== this.formData.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    var validateUpdatePwd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.pwdFormData.confirmPwd !== '') {
          this.$refs.pwdDataForm.validateField('confirmPwd')
        }
        callback()
      }
    }
    var validateUpdateConfirmPwd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认密码'))
      } else if (value !== this.pwdFormData.newPwd) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      searchToggle: true,
      tableColumns: [],
      allColumnsSelected: true,
      allColumnsSelectedIndeterminate: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: Object.assign(JSON.parse(JSON.stringify(defaultListQuery))),
      statusOptions: [-1, 1, 2, 3],
      userSelections: [],
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      dialogFormVisible: false,
      formData: Object.assign(JSON.parse(JSON.stringify(defaultFormData))),
      deptOptions: [],
      deptDefaultListQuery: Object.assign(JSON.parse(JSON.stringify(deptDefaultListQuery))),
      normalizer(node) {
        return {
          id: node.id,
          label: node.title,
          children: node.children
        }
      },
      jobData: [],
      rolesData: [],
      rules: {
        account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
      },
      dialogPwdVisible: false,
      pwdFormData: {
        id: undefined,
        newPwd: '',
        confirmPwd: ''
      },
      pwdRules: {
        newPwd: [{ validator: validateUpdatePwd, trigger: 'blur' }],
        confirmPwd: [{ validator: validateUpdateConfirmPwd, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 隐藏工具栏
    toggleSearch() {
      this.searchToggle = !this.searchToggle
    },
    //
    handleCheckAllChange(val) {
      if (val === false) {
        this.allColumnsSelected = true
        return
      }
      this.tableColumns.forEach(column => {
        if (!column.visible) {
          column.visible = true
          this.updateColumnVisible(column)
        }
      })
      this.allColumnsSelected = val
      this.allColumnsSelectedIndeterminate = false
    },
    // 全选
    handleSelectionChange(val) {
      this.userSelections = val
    },
    // 获取用户列表
    getUserList() {
      this.listLoading = true
      userList(this.listQuery).then((res) => {
        res.data.records.forEach(element => {
          element.freeze = element.status !== this.statusOptions[3]
        })
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 根据条件获取用户列表
    handleFilter() {
      this.listQuery.page = 1
      this.getUserList()
    },
    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.handleFilter()
    },
    // 冻结用户
    changeFreeze(row) {
      const setParams = { id: row.id }
      if (row.freeze) {
        userUnfreeze(setParams).then((res) => {
          this.$message({
            message: '解冻成功！',
            type: 'success'
          })
          row.status = this.statusOptions[2]
        })
      } else {
        userFreeze(setParams).then((res) => {
          this.$message({
            message: '冻结成功！',
            type: 'success'
          })
          row.status = this.statusOptions[3]
        })
      }
    },
    // 获取角色数据
    getRolesData() {
      this.rolesData = []
      const setParams = { page: 1, size: 50, filters: {}}
      roleList(setParams).then((res) => {
        res.data.records.forEach(element => {
          this.rolesData.push({ id: element.id, name: element.name, title: element.title })
        })
      })
    },
    // 获取部门列表
    getDeptList() {
      this.deptOptions = []
      deptList(this.deptDefaultListQuery).then((res) => {
        const depts = res.data.records
        depts.forEach(dept => {
          if (dept.hasChildren === true) {
            dept.children = null
          } else {
            dept.children = undefined
          }
          this.deptOptions.push(dept)
        })
      })
    },
    // 加载部门列表
    loadChildrenDept({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        const loadQuery = Object.assign(JSON.parse(JSON.stringify(deptDefaultListQuery)))
        loadQuery.filters.pid = parentNode.id
        deptList(loadQuery).then((res) => {
          parentNode.children = res.data.records.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 100)
        })
      }
    },
    // 获取岗位列表
    getJobList() {
      this.jobData = []
      const jobListQuery = {
        page: 1,
        size: 50,
        filters: {}
      }
      jobList(jobListQuery).then((res) => {
        this.jobData = res.data.records
      })
    },
    // 新增用户
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.deptDefaultListQuery = Object.assign(JSON.parse(JSON.stringify(deptDefaultListQuery)))
      this.getDeptList()
      this.getJobList()
      this.getRolesData()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 编辑用户
    handleUpdate(row) {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.deptDefaultListQuery = Object.assign(JSON.parse(JSON.stringify(deptDefaultListQuery)))
      this.deptDefaultListQuery.filters.depth = 5
      this.getDeptList()
      this.getJobList()
      this.getRolesData()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.formData.id = row.id
      for (const key in this.formData) {
        this.formData[key] = row[key]
      }
      this.formData.deptId = row.dept.id
      if (row.jobIds && Array.isArray(row.jobIds)) {
        this.formData.jobIds = row.jobIds.map(item => {
          return item.id
        })
      }
      if (row.roles && Array.isArray(row.roles)) {
        this.formData.roleIds = row.roles.map(item => {
          return item.id
        })
      }
    },
    // 表格提交
    handleConfirm() {
      let saveData = {
        account: this.formData.account,
        nickname: this.formData.nickname,
        mobile: this.formData.mobile,
        email: this.formData.email,
        sex: this.formData.sex,
        deptId: this.formData.deptId,
        jobIds: this.formData.jobIds,
        roleIds: this.formData.roleIds
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            saveData = Object.assign(saveData, { password: this.formData.password })
            userCreate(saveData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增用户成功！',
                type: 'success'
              })
              this.listQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
              this.getUserList()
            })
          }
          if (this.dialogStatus === 'update') {
            saveData = Object.assign(saveData, { id: this.formData.id })
            userUpdate(saveData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑用户成功！',
                type: 'success'
              })
              const index = this.list.findIndex(v => v.id === this.formData.id)
              for (const key in saveData) {
                this.list[index][key] = saveData[key]
              }
            })
          }
        } else {
          return false
        }
      })
    },
    // 删除用户
    handleDelete(row) {
      userDelete(row.id).then((res) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        const index = this.list.findIndex(v => v.id === row.id)
        if (index !== -1) {
          this.list[index].status = -1
        }
      })
    },
    // 密码修改弹窗
    handlePwdUpdate(row) {
      this.pwdFormData = {
        id: undefined,
        newPwd: '',
        confirmPwd: ''
      }
      this.dialogPwdVisible = true
      this.$nextTick(() => {
        this.$refs['pwdDataForm'].clearValidate()
      })
      this.pwdFormData.id = row.id
    },
    // 密码修改提交
    handlePwdConfirm() {
      this.$refs['pwdDataForm'].validate((valid) => {
        if (valid) {
          const setParams = { id: this.pwdFormData.id, password: this.pwdFormData.newPwd }
          userModifyPwd(setParams).then((res) => {
            this.dialogPwdVisible = false
            this.$message({
              message: '密码修改成功！',
              type: 'success'
            })
          })
        } else {
          return false
        }
      })
    },
    // 禁止操作行
    checkboxDisabled(row, index) {
      return row.id !== this.user.id
    }
  }
}
</script>

<style>
.crud-opts {
  width: 100%;
	padding: 4px 0;
	display: -webkit-flex;
	display: flex;
	align-items: center;
}
.crud-opts .crud-opts-right {
	margin-left: auto;
}
.crud-opts .crud-opts-right span {
	float: left;
}
</style>
