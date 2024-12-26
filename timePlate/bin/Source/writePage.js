
/**
Constructor
Do not call Function in Constructor.
*/
function writePage()
{
	AView.call(this);
	this.data = null; 
	this.mode = null;
}
afc.extendsClass(writePage, AView);


writePage.prototype.init = function(context, evtListener)
{
	AView.prototype.init.call(this, context, evtListener);
};

writePage.prototype.onInitDone = function()
{
	AView.prototype.onInitDone.call(this);
	
	const mode = this.getContainer().data.mode;
	this.mode = mode;
	
	const data = this.getContainer().data.data;
	this.data = data;
	
	if (mode == 'write'){
		this.writerLabel.element.style.display = 'none'; // 라벨 숨기기
	}else if (mode == 'edit') {
		this.writer.element.style.display = 'none'; // 텍스트필드 숨기기
		this.writerLabel.setText(data[3]);
		this.title.setText(data[1]);
    	this.content.setText(data[2]);
		this.submitOrUpdateBtn.setText("수정");
		this.cancleOrDeleteBtn.setText("삭제");
	}
};

writePage.prototype.onActiveDone = function(isFirst)
{
	AView.prototype.onActiveDone.call(this, isFirst);

	//TODO:edit here

};

// 날짜 형식 생성 함수
writePage.prototype.getFormattedDate = function() {
    const currentDate = new Date();
    return currentDate.getFullYear() + '-' +
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(currentDate.getDate()).padStart(2, '0') + ' ' +
        String(currentDate.getHours()).padStart(2, '0') + ':' +
        String(currentDate.getMinutes()).padStart(2, '0');
}

// 세션에 포스트 저장 함수
writePage.prototype.savePost = function(postId, newPost) {
    sessionStorage.setItem(`post${postId}`, JSON.stringify(newPost));
}

// 유효성 검사 함수
writePage.prototype.validateField = function(fieldValue, alertComponent, alertMessage, focusFunction, allAlerts) {
    // 모든 라벨 초기화
    allAlerts.forEach(alert => alert.setText(""));

    // 개별 필드 유효성 검사
    if (!fieldValue) {
        alertComponent.setText(alertMessage); // 경고 메시지 설정
        focusFunction();                      // 포커스 이동
        return false;
    }
    return true;
}


// 공통 글쓰기 및 수정 처리 함수
writePage.prototype.handlePostAction = function(status) {
    const formattedDate = this.getFormattedDate();
    const writerText = (this.mode == 'edit') ? this.writerLabel.getText() : this.writer.getText();
	const title = this.title.getText();
	const content = this.content.getText();
	
	 // 모든 경고 라벨을 배열로 전달
    const allAlerts = [this.writerAlert, this.titleAlert, this.contentAlert];

    // 유효성 검사
    if (!this.validateField(writerText, this.writerAlert, "작성자 입력은 필수입니다 !!!", () => this.writer.setFocus(), allAlerts)) return;
    if (!this.validateField(title, this.titleAlert, "제목을 입력하세요 !!", () => this.title.setFocus(), allAlerts)) return;
    if (!this.validateField(content, this.contentAlert, "내용을 입력하세요 !!", () => this.content.setFocus(), allAlerts)) return;
	

    let postId = 0;
    if (status === '확인') {
        // 새 글인 경우
        postId = parseInt(sessionStorage.getItem('No.') || '0') + 1;
        sessionStorage.setItem('No.', postId);
    } else if (status === '수정') {
        // 기존 글인 경우
        postId = this.data[0];  // 기존의 포스트 ID
    }

    const newPost = {
        id: postId,
        title: this.title.getText(),
        content: this.content.getText(),
        writer: writerText,
        date: (status === '수정' ? '! ' : '') + formattedDate
    };

    this.savePost(postId, newPost);
    this.getContainer().close(1);
}

// 글쓰기 or 수정 버튼
writePage.prototype.onsubmitOrUpdateBtnClick = function(comp, info, e)
{	
	const status = this.submitOrUpdateBtn.getText();
    this.handlePostAction(status);
};


writePage.prototype.oncancleOrDeleteBtnClick = function(comp, info, e)
{
	const status = this.cancleOrDeleteBtn.getText();
	if (status == '취소'){
		this.getContainer().close(0); 
	}else if (status == '삭제'){
		// 삭제할 포스트의 ID 가져오기 (this.data.id)
		const postIdToDelete = this.data[0];
		sessionStorage.removeItem(`post${postIdToDelete}`); // 해당 ID의 행을 세션에서 삭제

		// 삭제된 데이터를 전달하며 창을 닫음
		this.getContainer().close(1);
	}

};

writePage.prototype.oncancleBtnClick = function(comp, info, e)
{
	this.getContainer().close(0);
};
