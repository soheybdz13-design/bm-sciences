import { useEffect, useMemo, useState } from 'react'
import {
  FaEdit,
  FaExternalLinkAlt,
  FaFileAlt,
  FaFolderOpen,
  FaTrash,
} from 'react-icons/fa'
import { supabase } from '../lib/supabaseClient'

const R2_WORKER_URL =
  'https://bm-sciences-upload.soheybdz13.workers.dev'

const levelLabels = {
  first: 'الأولى متوسط',
  second: 'الثانية متوسط',
  third: 'الثالثة متوسط',
  fourth: 'الرابعة متوسط',
}

const sectionLabels = {
  pdf: 'مذكرات PDF',
  word: 'مذكرات Word',
  print: 'مطبوعات',
  videos: 'فيديوهات',
  ppt: 'عروض PPT',
  tests: 'فروض',
  exams: 'اختبارات',
  bem: 'مواضيع BEM',
  exercises: 'تمارين ووضعيات',
  summaries: 'ملخصات',
  draw: 'رسومات صماء',
  charts: 'مخططات',
  program: 'المنهاج',
  guide: 'الدليل',
  support: 'المعالجة البيداغوجية',
  teacher_documents: 'تقويم تشخيصي ووثائق أخرى',
  annual_progression: 'التدرج السنوي',
  monthly_distribution: 'التوزيع الشهري',
}

function getFileExtension(value = '') {
  const cleanValue = value.split('?')[0]

  return cleanValue
    .split('/')
    .pop()
    ?.split('.')
    .pop()
    ?.toUpperCase() || 'FILE'
}

function AdminFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    setLoading(true)

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      alert('وقع خطأ أثناء جلب الملفات')
    } else {
      setFiles(data || [])
    }

    setLoading(false)
  }

  function extractLegacyStoragePath(fullUrl, bucketName) {
    if (!fullUrl) return null

    const marker = `/${bucketName}/`
    const parts = fullUrl.split(marker)

    if (parts.length < 2) return null

    return parts[1]
  }

  function getR2Key(fileValue) {
    if (!fileValue) return null

    if (fileValue.startsWith('uploads/')) {
      return fileValue
    }

    try {
      const url = new URL(fileValue)
      const marker = '/files/'

      if (!url.pathname.startsWith(marker)) {
        return null
      }

      return decodeURIComponent(
        url.pathname.slice(marker.length)
      )
    } catch {
      return null
    }
  }

  function getFileValue(file) {
    return (
      file.pdf ||
      file.word ||
      file.image ||
      file.video ||
      file.ppt ||
      file.archive ||
      null
    )
  }

  function getPublicFileUrl(fileValue) {
    if (!fileValue) return null

    if (fileValue.startsWith('uploads/')) {
      const encodedKey = fileValue
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/')

      return `${R2_WORKER_URL}/files/${encodedKey}`
    }

    return fileValue
  }

  async function deleteR2File(key) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('انتهت جلسة الإدارة. أعد تسجيل الدخول.')
    }

    const response = await fetch(
      `${R2_WORKER_URL}/admin-delete?key=${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || 'تعذر حذف الملف من التخزين.'
      )
    }
  }

  async function deleteLegacyStorageFile(
    fileValue,
    bucketName
  ) {
    const path = extractLegacyStoragePath(
      fileValue,
      bucketName
    )

    if (!path) return

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      console.error(
        `خطأ في حذف الملف من bucket ${bucketName}:`,
        error
      )
    }
  }

  async function deleteFile(file) {
    const ok = window.confirm(
      `هل تريد حذف الملف نهائيًا؟\n\n${file.title}`
    )

    if (!ok) return

    try {
      setDeletingId(file.id)

      const fileValue = getFileValue(file)
      const r2Key = getR2Key(fileValue)

      if (r2Key) {
        await deleteR2File(r2Key)
      } else {
        await deleteLegacyStorageFile(file.pdf, 'pdfs')
        await deleteLegacyStorageFile(file.word, 'words')
        await deleteLegacyStorageFile(file.video, 'videos')
        await deleteLegacyStorageFile(file.image, 'images')
        await deleteLegacyStorageFile(file.ppt, 'ppts')
      }

      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', file.id)

      if (deleteError) {
        throw new Error(
          `تم حذف الملف من التخزين، لكن تعذر حذف سجله: ${deleteError.message}`
        )
      }

      setFiles(prev =>
        prev.filter(currentFile => currentFile.id !== file.id)
      )

      alert('تم حذف الملف والسجل بنجاح')
    } catch (err) {
      console.error('DELETE ERROR:', err)

      alert(
        err.message || 'حدث خطأ غير متوقع أثناء الحذف'
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function editFileTitle(file) {
    const newTitle = window.prompt(
      'اكتب الاسم الجديد للملف:',
      file.title
    )

    if (newTitle === null) return

    const cleanTitle = newTitle.trim()

    if (!cleanTitle) {
      alert('اسم الملف لا يمكن أن يكون فارغًا')
      return
    }

    if (cleanTitle === file.title) return

    try {
      setEditingId(file.id)

      const { error } = await supabase
        .from('lessons')
        .update({ title: cleanTitle })
        .eq('id', file.id)

      if (error) {
        throw new Error(error.message)
      }

      setFiles(prev =>
        prev.map(currentFile =>
          currentFile.id === file.id
            ? {
                ...currentFile,
                title: cleanTitle,
              }
            : currentFile
        )
      )

      alert('تم تعديل اسم الملف بنجاح')
    } catch (err) {
      console.error('EDIT TITLE ERROR:', err)

      alert(
        err.message || 'وقع خطأ أثناء تعديل اسم الملف'
      )
    } finally {
      setEditingId(null)
    }
  }

  const availableSections = useMemo(() => {
    if (!selectedLevel) {
      return Object.entries(sectionLabels)
    }

    const sectionsForLevel = new Set(
      files
        .filter(file => file.level === selectedLevel)
        .map(file => file.section)
    )

    return Object.entries(sectionLabels).filter(
      ([sectionKey]) =>
        sectionsForLevel.has(sectionKey)
    )
  }, [files, selectedLevel])

  const filteredFiles = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return files.filter(file => {
      const matchesLevel =
        !selectedLevel || file.level === selectedLevel

      const matchesSection =
        !selectedSection ||
        file.section === selectedSection

      const matchesSearch =
        !searchValue ||
        (file.title || '')
          .toLowerCase()
          .includes(searchValue)

      return (
        matchesLevel &&
        matchesSection &&
        matchesSearch
      )
    })
  }, [
    files,
    selectedLevel,
    selectedSection,
    search,
  ])

  function handleLevelChange(value) {
    setSelectedLevel(value)
    setSelectedSection('')
  }

  function clearFilters() {
    setSelectedLevel('')
    setSelectedSection('')
    setSearch('')
  }

  function preventSelectWheel(e) {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.blur()
  }

  return (
    <section
  className="admin-files-manager"
      dir="rtl"
      style={{
        marginTop: '40px',
        maxWidth: '1100px',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>
        إدارة الملفات المنشورة
      </h2>

      <p
        style={{
          textAlign: 'center',
          color: '#555',
          marginBottom: '22px',
        }}
      >
        اختر المستوى والقسم للوصول إلى الملفات، ثم افتح
        الملف أو عدّل اسمه أو احذفه.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <select
          value={selectedLevel}
          onWheel={preventSelectWheel}
          onChange={e => handleLevelChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
          }}
        >
          <option value="">كل المستويات</option>
          <option value="first">الأولى متوسط</option>
          <option value="second">الثانية متوسط</option>
          <option value="third">الثالثة متوسط</option>
          <option value="fourth">الرابعة متوسط</option>
        </select>

        <select
          value={selectedSection}
          onWheel={preventSelectWheel}
          onChange={e => setSelectedSection(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
          }}
        >
          <option value="">كل الأقسام</option>

          {availableSections.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          placeholder="ابحث باسم الملف..."
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '22px',
        }}
      >
        <span
          style={{
            color: '#1b5e20',
            fontWeight: 'bold',
          }}
        >
          عدد الملفات: {filteredFiles.length}
        </span>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={loadFiles}
            disabled={loading}
            style={{
              width: 'auto',
              margin: 0,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '7px',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            تحديث القائمة
          </button>

          <button
            onClick={clearFilters}
            style={{
              width: 'auto',
              margin: 0,
              background: '#757575',
              color: '#fff',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '7px',
              cursor: 'pointer',
            }}
          >
            إلغاء الفلاتر
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>
          جاري تحميل الملفات...
        </p>
      ) : filteredFiles.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '35px 15px',
            background: '#f8f9fa',
            borderRadius: '10px',
            color: '#666',
          }}
        >
          <FaFolderOpen
            style={{
              fontSize: '35px',
              marginBottom: '12px',
              color: '#999',
            }}
          />

          <p>لا توجد ملفات مطابقة للاختيار الحالي.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredFiles.map(file => {
            const fileValue = getFileValue(file)
            const publicFileUrl =
              getPublicFileUrl(fileValue)
            const fileType = getFileExtension(fileValue)

            return (
              <article
                key={file.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#fff',
                  boxShadow:
                    '0 4px 14px rgba(0, 0, 0, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <FaFileAlt
                    style={{
                      color: '#1b5e20',
                      fontSize: '24px',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  />

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '17px',
                        wordBreak: 'break-word',
                        lineHeight: '1.6',
                      }}
                    >
                      {file.title}
                    </h3>

                    <p
                      style={{
                        margin: '6px 0 0',
                        fontSize: '14px',
                        color: '#666',
                      }}
                    >
                      {levelLabels[file.level] ||
                        file.level}
                    </p>

                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '14px',
                        color: '#666',
                      }}
                    >
                      {sectionLabels[file.section] ||
                        file.section}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 10px',
                    background: '#f5f7fa',
                    borderRadius: '7px',
                    fontSize: '13px',
                  }}
                >
                  <span>نوع الملف</span>

                  <strong
                    style={{
                      color: '#1b5e20',
                    }}
                  >
                    {fileType}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(3, minmax(0, 1fr))',
                    gap: '8px',
                  }}
                >
                  {publicFileUrl ? (
                    <a
                      href={publicFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '7px',
                        textAlign: 'center',
                        padding: '10px 6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                      }}
                    >
                      <FaExternalLinkAlt
                        style={{ marginLeft: '5px' }}
                      />
                      فتح
                    </a>
                  ) : (
                    <span
                      style={{
                        background: '#9e9e9e',
                        color: '#fff',
                        borderRadius: '7px',
                        textAlign: 'center',
                        padding: '10px 6px',
                        fontSize: '13px',
                      }}
                    >
                      غير متوفر
                    </span>
                  )}

                  <button
                    onClick={() => editFileTitle(file)}
                    disabled={
                      editingId === file.id ||
                      deletingId === file.id
                    }
                    style={{
                      width: 'auto',
                      margin: 0,
                      background: '#f57c00',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '10px 6px',
                      cursor:
                        editingId === file.id
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    <FaEdit
                      style={{ marginLeft: '5px' }}
                    />

                    {editingId === file.id
                      ? 'جاري...'
                      : 'تعديل'}
                  </button>

                  <button
                    onClick={() => deleteFile(file)}
                    disabled={
                      deletingId === file.id ||
                      editingId === file.id
                    }
                    style={{
                      width: 'auto',
                      margin: 0,
                      background: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '10px 6px',
                      cursor:
                        deletingId === file.id
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    <FaTrash
                      style={{ marginLeft: '5px' }}
                    />

                    {deletingId === file.id
                      ? 'جاري...'
                      : 'حذف'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminFiles