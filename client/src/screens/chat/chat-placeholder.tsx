

export function Placeholder() {
    return (
      <div className="hidden h-full items-center justify-center text-center lg:flex">
        <div className="text-center">
          <div className="mx-auto bg-muted rounded-full size-24 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            >
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No chat selected</h3>
          <p className="text-muted-foreground max-w-xs">
            Select a chat from the list to start messaging
          </p>
        </div>
      </div>
    );
  }
