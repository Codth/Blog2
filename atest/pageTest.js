function divide(cur, end){
    let result = [1];
    let next;

    if(end <= 8){
        for(let i =2; i<=end; i++){
            result.push(i);
        }
    }else{
        if((cur < 5) && ((end-cur) > 3)){
            result.push(2,3,4,5,"...",end-1, end);
            next = 6;

        }

        if((cur >= 5) && ((end-cur) > 4)){
            result.push(cur-1, cur, cur+1, cur+2, "...", end-1, end);
            next = cur + 3;
        }

        if((cur >= 5) && ((end-cur) <= 4)){
            result.push(2, "...", end-4, end-3, end-2, end-1, end);
            next = end - 5;
        }
    }
    return [result, next];
}




let [s,cur] = divide(12,18);
console.log(s);
console.log(cur);



//
//
//
// let a =[];
// a.push(1,2);
// console.log(a)

// function jump(cur, end, arr){
//     var index = fruits.indexOf("up");
//     var index2 = fruits.indexOf("down");
//     var before = index-1;
//     var after = index+1;
//
//
//     if(index){
//         if((after-before) < 5){
//             arr[1] = arr[4]+1;
//             arr[2] = arr[1]+1;
//             arr[3] = arr[1]+2;
//             arr[4] = arr[1]+3;
//             arr[5] = "up";
//         }else{
//             arr[1] = "down";
//             arr[2] = arr[1]+1;
//             arr[3] = arr[6]-3;
//             arr[4] = arr[6]-2;
//             arr[5] = arr[6]-1;
//         }
//     }else{
//
//     }
// }
