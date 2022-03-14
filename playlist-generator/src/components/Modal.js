import ReactDOM from 'react-dom';
import '../styles/Modal.scss';

export default function Modal(props) {
    return ReactDOM.createPortal((
        <div className="modal-backdrop">
            <div className="modal">
                {props.children}
            </div>
        </div>
    ), document.body);
}
