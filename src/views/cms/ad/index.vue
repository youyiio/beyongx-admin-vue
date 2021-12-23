<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="searchToggle">
        <el-form ref="searchForm" :model="listQuery.filters" :inline="true">
          <el-form-item prop="keyword">
            <el-input v-model="listQuery.filters.keyword" clearable size="mini" placeholder="输入关键词搜索" style="width: 150px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="slotId">
            <el-select v-model="listQuery.filters.slotId" style="width: 150px" placeholder="请选择广告位置">
              <el-option v-for="item in slotsData" :key="item.id" :label="item.title" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter()"> 搜索 </el-button>
          <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="handleReset()">重置</el-button>
        </el-form>
      </div>
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['ad:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="adSelections.length !== 1" @click="handleUpdate(adSelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['ad:delete']" :title="`确认删除所选${adSelections.length}条数据吗？`" @onConfirm="handleDelete(adSelections[0])">
            <el-button slot="reference" class="filter-item" size="mini" type="danger" icon="el-icon-delete" :disabled="adSelections.length !== 1"> 删除 </el-button>
          </el-popconfirm>
        </span>
        <el-button-group class="crud-opts-right">
          <el-button size="mini" plain type="info" icon="el-icon-search" @click="toggleSearch()" />
          <el-button size="mini" icon="el-icon-refresh" @click="getAdList()" />
          <el-popover placement="bottom-end" width="150" trigger="click">
            <el-button slot="reference" size="mini" icon="el-icon-s-grid">
              <i class="fa fa-caret-down" aria-hidden="true" />
            </el-button>
            <el-checkbox> 全选 </el-checkbox>
            <el-checkbox />
          </el-popover>
        </el-button-group>
      </div>
    </div>

    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '广告'" width="500px">
      <el-form ref="dataForm" inline :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="链接" prop="url">
          <el-input v-model="formData.url" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="位置" prop="slotId">
          <el-select v-model="formData.slotId" style="width: 300px" placeholder="请选择广告位置">
            <el-option v-for="item in slotsData" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model.number="formData.sort" :min="0" :max="999" controls-position="right" style="width: 300px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>

    <!--表格渲染-->
    <el-table ref="adTable" :key="tableKey" v-loading="listLoading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="显示位置" prop="account" width="150" />
      <el-table-column label="标题" :show-overflow-tooltip="true" prop="title" width="200px" />
      <el-table-column label="链接" :show-overflow-tooltip="true" prop="url" />
      <el-table-column label="创建时间" prop="createTime" width="150" />
      <el-table-column label="排序" prop="sort" align="center" width="80" />
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-popconfirm v-permission="['ad:delete']" title="确认删除本条数据吗？" @onConfirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getAdList()" />
  </div>
</template>

<script>
import { adCreate, adDelete, adList, adUpdate, slotList } from '@/api/cms/ad'
import Pagination from '@/components/Pagination'

const defaultFormData = {
  id: undefined,
  title: '',
  slotId: '',
  url: '',
  sort: 999
}

const defaultListQuery = {
  page: 1,
  size: 20,
  filters: {
    keyword: undefined,
    slotId: undefined
  }
}

export default {
  name: 'AdList',
  components: { Pagination },
  data() {
    return {
      searchToggle: true,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: Object.assign(JSON.parse(JSON.stringify(defaultListQuery))),
      slotsData: [],
      adSelections: [],
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      dialogFormVisible: false,
      formData: Object.assign(JSON.parse(JSON.stringify(defaultFormData))),
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        url: [{ required: true, message: '请输入链接', trigger: 'blur' }],
        slotId: [{ required: true, message: '请选择显示位置', trigger: 'blur' }],
        sort: [{ required: true, message: '请排序', trigger: 'blur' }]
      }
    }
  },

  created() {
    this.getAdList()
    this.getSlotsData()
  },
  methods: {
    // 隐藏工具栏
    toggleSearch() {
      this.searchToggle = !this.searchToggle
    },
    // 全选
    handleSelectionChange(val) {
      this.adSelections = val
    },
    // 获取广告列表
    getAdList() {
      this.listLoading = true
      adList(this.listQuery).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 根据条件获取广告列表
    handleFilter() {
      this.listQuery.page = 1
      this.getAdList()
    },
    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.handleFilter()
    },
    // 获取广告位置数据
    getSlotsData() {
      this.slotsData = []
      slotList().then((res) => {
        res.data.forEach(element => {
          this.slotsData.push({ id: element.id, name: element.name, title: element.title })
        })
      })
    },
    // 新增广告
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 编辑广告
    handleUpdate(row) {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.formData.id = row.id
      for (const key in this.formData) {
        this.formData[key] = row[key]
      }
    },
    // 表格提交
    handleConfirm() {
      let saveData = {
        title: this.formData.title,
        url: this.formData.url,
        slotIds: [this.formData.slotId],
        sort: this.formData.sort,
        imageId: 0,
        startTime: null,
        endTime: null
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            adCreate(saveData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增广告成功！',
                type: 'success'
              })
              this.listQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
              this.getAdList()
            })
          }
          if (this.dialogStatus === 'update') {
            saveData = Object.assign(saveData, { id: this.formData.id })
            adUpdate(saveData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑广告成功！',
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
    // 删除广告
    handleDelete(row) {
      adDelete(row.id).then((res) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        const index = this.list.findIndex(v => v.id === row.id)
        if (index !== -1) {
          this.list.splice(index, 1)
        }
      })
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
<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
