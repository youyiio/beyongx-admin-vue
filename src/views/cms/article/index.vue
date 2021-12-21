<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="searchToggle">
        <el-form ref="searchForm" :model="listQuery.filters" :inline="true">
          <el-form-item prop="keyword">
            <el-input v-model="listQuery.filters.keyword" clearable size="mini" placeholder="输入关键字搜索" style="width: 200px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="listQuery.filters.status" clearable size="mini" placeholder="状态" style="width: 90px" class="filter-item">
              <el-option v-for="status in statusOptions" :key="status" :label="status | statusFilter" :value="status" />
            </el-select>
          </el-form-item>
          <el-form-item prop="categoryId">
            <treeselect v-model="listQuery.filters.categoryId" :options="categoryOptions" :normalizer="normalizer" :searchable="false" style="width: 150px;" placeholder="选择所属分类" class="filter-item" size="mini" />
          </el-form-item>
          <el-form-item prop="dateTime">
            <el-date-picker v-model="listQuery.filters.dateTime" clearable size="mini" type="daterange" align="right" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" value-format="yyyy-MM-dd HH:mm:ss" class="date-item" />
          </el-form-item>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter()"> 搜索 </el-button>
          <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="handleReset()">重置</el-button>
        </el-form>
      </div>
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="articleSelections.length !== 1" @click="handleUpdate(articleSelections[0])"> 修改 </el-button>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-thumb" :disabled="publishable" @click="handlePublish(articleSelections)"> 发布 </el-button>
          <el-popconfirm :title="`确认删除所选${articleSelections.length}条数据吗？`" @onConfirm="handleDelete(articleSelections[0])">
            <el-button slot="reference" class="filter-item" size="mini" type="danger" icon="el-icon-delete" :disabled="deleteable"> 删除 </el-button>
          </el-popconfirm>
          <el-button class="filter-item" size="mini" type="warning" icon="el-icon-download" :loading="downloadLoading" @click="handleDownload()"> 导出 </el-button>
        </span>
        <el-button-group class="crud-opts-right">
          <el-button size="mini" plain type="info" icon="el-icon-search" @click="toggleSearch()" />
          <el-button size="mini" icon="el-icon-refresh" @click="getArticleList()" />
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

    <el-table ref="articleTable" :key="tableKey" v-loading="listLoading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="标题" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleDetail(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属分类" width="160">
        <template slot-scope="{ row }">
          <span v-for="(category, index) in row.categorys" :key="index">
            <el-tag v-if="category" type="info" size="mini" effect="plain">{{ category.title }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="作者" prop="author" width="120" />
      <el-table-column label="状态" class-name="status-col" width="80">
        <template slot-scope="{ row }">
          <span> {{ row.status | statusFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="浏览量" prop="readCount" width="80" align="center" />
      <el-table-column label="发布日期" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.postTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row, $index }">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button size="mini" type="success" icon="el-icon-thumb" :disabled="row.status === statusOptions[6]" @click="handlePublish(row)" />
          <el-popconfirm title="确认删除本条数据吗？" @onConfirm="handleDelete(row, $index)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" :disabled="row.status === statusOptions[0]" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getArticleList()" />

  </div>
</template>

<script>
import { articleList, articleDelete, articlePublish } from '@/api/cms/article'
import { categoryList } from '@/api/cms/category'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const defaultListQuery = {
  page: 1,
  size: 20,
  filters: {
    keyword: undefined,
    status: undefined,
    categoryId: undefined,
    dateTime: '',
    startTime: '',
    endTime: ''
  }
}

export default {
  name: 'ArticleList',
  components: { Pagination, Treeselect },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '-1': '已删除',
        0: '草稿',
        1: '申请发布',
        2: '初审拒绝',
        3: '初审通过',
        4: '终审拒绝',
        5: '已发布'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      searchToggle: true,
      tableKey: 0,
      publishable: true,
      deleteable: true,
      articleSelections: [],
      categoryOptions: [],
      normalizer(node) {
        return {
          id: node.id,
          label: node.title,
          children: node.children
        }
      },
      list: null,
      total: 0,
      listLoading: true,
      listQuery: Object.assign(JSON.parse(JSON.stringify(defaultListQuery))),
      statusOptions: [-1, 0, 1, 2, 3, 4, 5],
      downloadLoading: false
    }
  },
  created() {
    this.getArticleList()
    this.getCategoryList()
  },
  methods: {
    // 隐藏工具栏
    toggleSearch() {
      this.searchToggle = !this.searchToggle
    },

    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.getArticleList()
    },

    // 获取分类列表
    getCategoryList() {
      const categoryParams = {
        page: 1,
        size: 50,
        filters: {
          struct: 'tree',
          pid: 0,
          depth: 5
        }
      }
      categoryList(categoryParams).then((res) => {
        this.categoryOptions = res.data.records
      })
    },

    // 获取文章列表
    getArticleList() {
      this.listLoading = true
      const queryDateTime = this.listQuery.filters.dateTime
      if (queryDateTime.length === 2 && Array.isArray(queryDateTime)) {
        this.listQuery.filters.startTime = queryDateTime[0]
        this.listQuery.filters.endTime = queryDateTime[1]
      } else {
        this.listQuery.filters.startTime = ''
        this.listQuery.filters.endTime = ''
      }
      const queryDatas = Object.assign(JSON.parse(JSON.stringify(this.listQuery)))
      queryDatas.filters.dateTime = undefined
      articleList(queryDatas).then((response) => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 根据条件获取文章列表
    handleFilter() {
      this.listQuery.page = 1
      this.getArticleList()
    },
    // 全选
    handleSelectionChange(val) {
      this.deleteable = false
      this.publishable = false
      val.forEach(element => {
        if (element.status === this.statusOptions[0]) {
          this.deleteable = true
        }
        if (element.status === this.statusOptions[6]) {
          this.publishable = true
        }
      })
      this.articleSelections = val
    },

    // 发布文章
    handlePublish(row) {
      const publishParams = {}
      const articleIds = []
      if (Array.isArray(row)) {
        for (const item of row) {
          articleIds.push(item.id)
        }
        publishParams.ids = articleIds
      } else {
        publishParams.id = row.id
      }
      articlePublish(publishParams).then((res) => {
        this.$message({
          message: '发布成功',
          type: 'success'
        })
        if (Array.isArray(row)) {
          this.getArticleList()
        } else {
          row.status = this.statusOptions[6]
        }
      })
    },
    // 删除文章
    handleDelete(row, index) {
      const deleteParams = {}
      const articleIds = []
      if (Array.isArray(row)) {
        for (const item of row) {
          articleIds.push(item.id)
        }
        deleteParams.ids = articleIds
      } else {
        deleteParams.id = row.id
      }
      articleDelete(deleteParams).then((response) => {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        if (Array.isArray(row)) {
          this.getArticleList()
        } else {
          this.list.splice(index, 1)
        }
      })
    },
    // 文章详情
    handleDetail(row) {
      this.$router.push({
        path: '/articleDetail',
        query: { articleId: row.id }
      })
    },
    // 新增文章
    handleCreate() {
      this.$router.push({
        path: '/articleCreate'
      })
    },
    // 编辑文章
    handleUpdate(row) {
      this.$router.push({
        name: 'ArticleUpdate',
        // path: '/cms/articleUpdate',
        params: {
          articleId: row.id,
          operStatus: 'update'
          // formData: row
        }
      })
    },

    // 导出文章
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = [
          'timestamp',
          'title',
          'type',
          'importance',
          'status'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
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
