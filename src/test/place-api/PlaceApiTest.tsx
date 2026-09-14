import { useEffect, useState } from 'react'
import { getPlaces } from './placeApi'
import type { Place } from './types'
import './PlaceApiTest.css'

type RequestState = 'loading' | 'success' | 'error'

export function PlaceApiTest() {
  const [places, setPlaces] = useState<Place[]>([])
  const [requestState, setRequestState] = useState<RequestState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const loadPlaces = async () => {
    try {
      const data = await getPlaces()
      setPlaces(data)
      setRequestState('success')
    } catch (error) {
      setRequestState('error')
      setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    }
  }

  const refreshPlaces = () => {
    setRequestState('loading')
    setErrorMessage('')
    void loadPlaces()
  }

  useEffect(() => {
    const controller = new AbortController()
    void getPlaces(controller.signal)
      .then((data) => {
        setPlaces(data)
        setRequestState('success')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return

        setRequestState('error')
        setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
      })

    return () => controller.abort()
  }, [])

  return (
    <section className="api-card" aria-labelledby="place-list-title">
      <div className="api-card__toolbar">
        <div>
          <div className="api-card__status-row">
            <span
              className={`status-dot status-dot--${requestState}`}
              aria-hidden="true"
            />
            <span>{requestState === 'success' ? 'API 연결됨' : requestState === 'error' ? '연결 실패' : '연결 중'}</span>
          </div>
          <h2 id="place-list-title">등록된 주차장</h2>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={refreshPlaces}
          disabled={requestState === 'loading'}
        >
          {requestState === 'loading' ? '불러오는 중…' : '새로고침'}
        </button>
      </div>

      {requestState === 'error' && (
        <div className="api-message api-message--error" role="alert">
          <strong>{errorMessage}</strong>
          <span>Spring Boot 서버가 8080 포트에서 실행 중인지 확인해 주세요.</span>
        </div>
      )}

      {requestState === 'loading' && (
        <div className="api-message" role="status">데이터를 불러오고 있습니다.</div>
      )}

      {requestState === 'success' && places.length === 0 && (
        <div className="api-message">연결은 성공했지만 등록된 주차장 데이터가 없습니다.</div>
      )}

      {requestState === 'success' && places.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>주소</th>
                <th>상세 주소</th>
                <th>좌표</th>
                <th>설명</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.id}>
                  <td>{place.id}</td>
                  <td className="place-name">{place.name ?? '-'}</td>
                  <td>{place.address}</td>
                  <td>{place.detailAdress ?? '-'}</td>
                  <td className="coordinates">
                    {place.latitude}<br />{place.longitude}
                  </td>
                  <td>{place.description ?? '-'}</td>
                  <td>{formatDate(place.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function formatDate(value: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR')
}
