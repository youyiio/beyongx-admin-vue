<template>
  <div class="app-container">
    <el-row>
      <el-col>
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">{{ operStatus === 'update' ? '编辑文章' : '新增文章' }}</span>
          </div>
          <div>
            <el-form ref="dataForm" :model="formData" :rules="rules" label-width="80px" size="mini" style="margin-left:50px;">
              <el-form-item label="文章标题" prop="title">
                <el-input v-model="formData.title" style="width: 250px;" />
              </el-form-item>
              <el-form-item label="文章分类" prop="categoryIds">
                <treeselect
                  v-model="formData.categoryIds"
                  :multiple="true"
                  :flat="true"
                  :searchable="false"
                  :options="categoryOptions"
                  :normalizer="normalizer"
                  style="width: 250px;"
                  placeholder="选择所属分类"
                  size="mini"
                  @change="test()"
                />
              </el-form-item>
              <el-form-item label="关键词" prop="keywords">
                <el-input v-model="formData.keywords" style="width: 250px;" />
              </el-form-item>
              <el-form-item label="摘要" prop="description">
                <el-input v-model="formData.description" type="textarea" rows="5" style="width: 250px;" />
              </el-form-item>
              <el-form-item label="文章内容" prop="content" style="margin-bottom: 30px;">
                <Tinymce ref="editor" v-model="formData.content" :width="800" :height="400" />
              </el-form-item>
              <el-form-item>
                <el-button v-if="operStatus === 'create'" type="primary" icon="el-icon-plus" @click="handleSubmit()"> 立即发布 </el-button>
                <el-button v-if="operStatus === 'update'" type="success" icon="el-icon-edit" @click="handleSubmit()"> 立即提交 </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { articleCreate, articleDetail, articleUpdate } from '@/api/cms/article'
import { categoryList } from '@/api/cms/category'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Tinymce from '@/components/Tinymce'

export default {
  name: 'ArticleOperation',
  components: { Treeselect, Tinymce },
  props: {
    articleId: {
      type: Number,
      default: 0
    },
    operStatus: {
      type: String,
      default: 'create'
    },
    formData: {
      type: Object,
      default: () => {
        return {
          title: '',
          categoryIds: [],
          keywords: '',
          description: '',
          tags: [],
          thumbImageId: [],
          metaImageIds: [],
          metaFileIds: [],
          content: ''
        }
      }
    }
  },
  data() {
    return {
      categoryOptions: [],
      normalizer(node) {
        return {
          id: node.id,
          label: node.title,
          children: node.children
        }
      },
      rules: {
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' }
        ],
        categoryIds: [
          { required: true, message: '请选择文章分类', trigger: 'blur' }
        ],
        keywords: [
          { required: true, message: '请输入文章关键词', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入文章摘要', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    if (this.operStatus === 'update') {
      this.getArticleDetail()
    }
    this.getCategoryList()
  },
  methods: {
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

    // 获取编辑文章
    getArticleDetail() {
      const articleId = this.articleId
      articleDetail(articleId).then((res) => {
        const article = res.data
        this.formData.title = article.title
        article.categorys.forEach(element => {
          this.formData.categoryIds.push(element.id)
        })
        this.formData.keywords = article.keywords
        this.formData.description = article.description
        this.formData.content = article.content
      })
    },

    // 表单提交
    handleSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.operStatus === 'create') {
            articleCreate(this.formData).then((res) => {
              this.$message({
                message: '发布文章成功！',
                type: 'success'
              })
              this.$router.push({
                path: '/cms/articleList'
              })
            })
          }
          if (this.operStatus === 'update') {
            this.formData['id'] = this.articleId
            articleUpdate(this.articleId, this.formData).then((res) => {
              this.$message({
                message: '编辑文章成功！',
                type: 'success'
              })
              this.$router.push({
                path: '/cms/articleList'
              })
            })
          }
        }
      })
    }

  }
}
</script>
