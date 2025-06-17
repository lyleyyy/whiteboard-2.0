interface UserDisplayerProps {
  username: string;
}

function UserDisplayer({ username }: UserDisplayerProps) {
  return (
    <div className="absolute right-10 bottom-10">
      <div
        className="
        w-16 h-16
        rounded-full
        bg-blue-500
        text-white
        flex items-center justify-center
        shadow-lg
        hover:bg-blue-600
        transition-colors duration-300
        cursor-pointer
        text-sm font-semibold
        overflow-hidden
        whitespace-nowrap
        group
      "
      >
        <span
          className="
          px-2
          transform transition-all duration-300 ease-out
          group-hover:scale-110
          group-hover:opacity-0
          absolute
          text-center
          overflow-hidden
          text-ellipsis
        "
        >
          {username}
        </span>

        <span
          className="
          absolute
          opacity-0
          transform transition-all duration-300 ease-out
          group-hover:scale-100
          group-hover:opacity-100
          text-center
        "
        >
          {username}
        </span>
      </div>
    </div>
  );
}

export default UserDisplayer;
