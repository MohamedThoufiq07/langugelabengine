import Panel from "../../ui/components/Panel";

function OneColumn({ children }) {

    return (

        <div className="elab-one-column">

            <Panel>

                {children}

            </Panel>

        </div>

    );

}

export default OneColumn;