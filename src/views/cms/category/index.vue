<template>
  <div class="app-container">
    <div class="head-container">
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus"> 新增 </el-button>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit"> 修改 </el-button>
          <el-button class="filter-item" type="danger" icon="el-icon-delete" size="mini"> 删除 </el-button>
        </span>
      </div>
    </div>
    <!-- 表格渲染 -->
    <el-table ref="categoryTable" :key="tableKey" v-loading="listLoading" :data="list" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="30" />
      <el-table-column type="" label="ID" prop="id" align="center" width="80" />
      <el-table-column label="分类名称" prop="title" />
      <el-table-column label="英文名称" prop="name" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enabled" active-color="#409EFF" inactive-color="#F56C6C" @change="changeEnabled(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button size="mini" type="success" @click="handlePublish(row)"> 发布 </el-button>
          <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
    <!--表单组件-->
    <!-- <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="分类名称" prop="title">
          <el-input v-model="form.title" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="分类排序" prop="sort">
          <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="顶级分类">
          <el-radio-group v-model="form.level" style="width: 140px">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio v-for="item in {[1:'上线']}" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
        </el-form-item>
        <el-form-item v-if="form.level === '0'" style="margin-bottom: 0;" label="上级分类" prop="pid">
          <treeselect
            v-model="form.pid"
            :load-options="loadDepts"
            :options="depts"
            style="width: 370px;"
            placeholder="选择上级类目"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text">取消</el-button>
        <el-button type="primary">确认</el-button>
      </div>
    </el-dialog> -->

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
import { categoryList, setStatus } from '@/api/cms/category'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { filterTree } from '@/utils'

export default {
  name: 'CategoryList',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      tableSelections: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        filters: {
          struct: 'tree',
          pid: 0,
          depth: 5
        }
      },
      dialogVisible: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取文章列表
    getList() {
      this.listLoading = true
      categoryList(this.listQuery).then((response) => {
        const listData = response.data.records
        listData.forEach(element => {
          element.enabled = true
          if (element.status !== 1) {
            element.enabled = false
          }
        })
        this.list = filterTree(listData, false)
        this.total = response.data.total
        this.listLoading = false
      })
    },

    // 更改状态
    changeEnabled(row) {
      const setParams = {
        id: row.id,
        status: row.status === 1 ? 0 : 1
      }
      setStatus(setParams).then((response) => {
        this.$message({
          message: setParams['status'] === 1 ? '上线' : '下线' + '成功',
          type: 'success'
        })
      })
    },

    handleSelectionChange(val) {
      this.tableSelections = val
    },

    // 发布文章
    handlePublish(row) {
    //   const publishParams = { id: row.id }
    //   publishArticle(publishParams).then((response) => {
    //     this.$message({
    //       message: '发布成功',
    //       type: 'success'
    //     })
    //     row.status = this.statusOptions[6]
    //   })
    },
    // 删除文章
    handleDelete(row, index) {
    //   const deleteParams = { id: row.id }
    //   deleteArticle(deleteParams).then((response) => {
    //     this.$message({
    //       message: '删除成功',
    //       type: 'success'
    //     })
    //     this.list.splice(index, 1)
    //   })
    },
    // 文章详情
    handleDetail(row) {
      this.$router.push({
        path: '/cms/articleDetail',
        query: { articleId: row.id }
      })
    },
    // 编辑文章
    handleUpdate(row) {}

  }
}
</script>

<style>
.crud-opts {
	padding: 4px 0;
	display: -webkit-flex;
	display: flex;
	align-items: center;
  margin-left: auto;
  float: left;
}
</style>
