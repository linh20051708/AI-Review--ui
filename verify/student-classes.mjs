import assert from 'node:assert/strict'
import {register} from 'node:module'
register('./self-service-loader.mjs',import.meta.url)
const storage=new Map()
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}
const {getManagementState}=await import('../src/data/managementStore.ts')
const {studentClasses}=await import('../src/pages/student/studentClasses.ts')
const state=structuredClone(getManagementState())
const student=state.students.find(s=>s.id==='s1')
const secondClass=state.classes.find(c=>c.id==='self-service-class')
student.enrolledClassIds=[secondClass.id,secondClass.id]
const secondGroup={id:'test-second-group',classId:secondClass.id,name:'Second group',memberIds:[student.id],leaderId:student.id,progress:0,pendingReviews:0,health:'onTrack',lastActivity:''}
state.groups.push(secondGroup)
state.registrations.push({id:'test-registration',groupId:secondGroup.id,submittedBy:student.id,name:'Pending project',description:'scope',status:'pending',submittedAt:'',decisions:[]})
const original=structuredClone(state)
const classes=studentClasses(state,student)
assert.equal(classes.length,2,'multiple enrollments, no duplicate class cards')
const primary=classes.find(c=>c.cls.id===student.classId), secondary=classes.find(c=>c.cls.id===secondClass.id)
assert.ok(primary.project,'legacy project remains available')
assert.equal(secondary.group.id,secondGroup.id)
assert.equal(secondary.project,undefined,'pending registration is not an active project')
assert.equal(secondary.registration.status,'pending')
assert.notEqual(primary.course.id,secondary.course.id,'different subjects retain independent academic contexts')
assert.notEqual(primary.group.id,secondary.group.id,'groups remain per class')
assert.deepEqual(state,original,'overview does not mutate saved academic or review data')
assert.deepEqual(studentClasses(state,undefined),[])
assert.equal(studentClasses(state,{...student,classId:'',enrolledClassIds:[]}).length,0,'unenrolled classes are not visible')
console.log('PASS multi-class overview: distinct courses/groups/projects, pending registration, legacy preservation, no duplicates or unauthorized classes')
