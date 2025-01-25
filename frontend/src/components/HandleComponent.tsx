const HandleComponent = ({user}) => {
    return (
        <>
            {
                user.role ?
                    <span
                        className="">
                        {user.handle}
                    </span>
                    :
                    <span className="text-slate-400">
                        {user.handle}
                    </span>
            }
        </>
    )
}

export default HandleComponent