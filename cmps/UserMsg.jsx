const { useState, useEffect } = React

export function UserMsg() {
    const [msg, setMsg] = useState(null)

    useEffect(() => {
        const unsubscribe = eventBusService.on('show-user-msg', (msg) => {
            setMsg(msg)
            setTimeout(() => {
                setMsg(null)
            }, 3000)
        })

        return () => {
            unsubscribe()
        }
    }, [])

    if (!msg) return null
    return (
        <div className={`user-msg ${msg.type}`}>
            {msg.txt}
            <button onClick={() => setMsg(null)}>×</button>
        </div>
    )
}