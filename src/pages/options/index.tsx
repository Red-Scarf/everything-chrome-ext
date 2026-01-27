import { useEffect, useState } from "react"
import { getConfig, saveConfig } from "../../utils/config"
import "../../styles/options.css"

export default function OptionsPage() {
  const [baseUrl, setBaseUrl] = useState("")
  const [paramsStr, setParamsStr] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // 加载保存的设置
    const loadSettings = async () => {
      const config = await getConfig()
      setBaseUrl(config.baseUrl)
      setParamsStr(JSON.stringify(config.params, null, 4))
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setError("")
      const params = JSON.parse(paramsStr)
      await saveConfig(baseUrl, params)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError("无效的 JSON 参数")
    }
  }

  return (
    <div className="options-container">
      <h1>Everything 扩展设置</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}>
        <div className="form-group">
          <label htmlFor="url">Everything HTTP 服务地址:</label>
          <input
            id="url"
            type="url"
            placeholder="http://127.0.0.1:8181"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <p className="help-text">默认: http://127.0.0.1:8181</p>
        </div>

        <div className="form-group">
          <label htmlFor="params">搜索参数 (JSON):</label>
          <textarea
            id="params"
            rows={8}
            value={paramsStr}
            onChange={(e) => setParamsStr(e.target.value)}
            style={{ width: "100%", fontFamily: "monospace" }}
          />
          <p className="help-text">
            配置默认搜索参数 (如数量、排序等)
          </p>
        </div>

        {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

        <button type="submit" className="btn-save">
          保存设置
        </button>

        {saved && <p className="success-message">✓ 设置已保存!</p>}
      </form>

      <section className="help-section">
        <h2>设置说明</h2>
        <ol>
          <li>确保 Everything 已在您的电脑上运行</li>
          <li>在 Everything 选项中启用 HTTP 服务器</li>
          <li>
            在 Everything.ini 中配置 CORS:
            <pre>http_server_header=Access-Control-Allow-Origin: *</pre>
          </li>
        </ol>
      </section>
    </div>
  )
}
