import { useEffect, useState } from "react"
import "../../styles/popup.css"

export default function PopupPage() {
  const [searchText, setSearchText] = useState("")
  const [results, setResults] = useState<string[]>([])

  const handleSearch = async () => {
    if (!searchText.trim()) return

    // 向后台脚本发送消息
    chrome.runtime.sendMessage(
      {
        todo: "searchFilm",
        data: searchText
      },
      (response) => {
        console.log("搜索响应:", response)
      }
    )
  }

  return (
    <div className="popup-container">
      <h1>Everything 搜索</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索文件..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>搜索</button>
      </div>
      <div className="results">
        {results.length > 0 ? (
          <ul>
            {results.map((result, idx) => (
              <li key={idx}>{result}</li>
            ))}
          </ul>
        ) : (
          <p>无结果</p>
        )}
      </div>
    </div>
  )
}
