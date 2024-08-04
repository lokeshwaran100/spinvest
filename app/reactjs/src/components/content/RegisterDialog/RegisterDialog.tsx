import { useAppContext } from "../AppProvider/AppProvider";
import { register } from "../utils/apiRequests"

export function HomePage() {
    const { program, userPublicKey } = useAppContext();
    return (
        <div>
            <div className="oj-sm-padding-2x-vertical">
                <button
                    onClick={() => {
                        if (program && userPublicKey) {
                            register(program, userPublicKey)
                        }
                    }}
                >
                    Register
                </button>
            </div>
        </div>
    );
}
